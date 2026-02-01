import ExcelJS from 'exceljs';
import { OtRepository } from '../../data/repositories/OtRepository';
import { OtFilter } from '../../data/dto/OtFilter';
import { OTState, ItemType, ReportCategory } from '../../api/types/ot.enums';

// Interface ReportRow match DB result from OtRepository.getReportData
interface ReportRow {
    street: string;
    number_street: string | null;
    commune: string;
    item_description: string;
    external_ot_id: string | null;
    quantity: string | number;
    is_additional: boolean | null;
    movil_code: string | null;
    finished_at: Date | string | null;
    effective_date?: Date | string | null;
    started_at?: Date | string | null;      // Added field
    civil_work_at?: Date | string | null;   // Added field
    received_at?: Date | string | null;     // Added field
    item_type: string;
    item_value: string | number;
    ot_state: string;
}

// Strategy Pattern Definitions
type DateResolver = (row: ReportRow) => Date | string | null | undefined;

interface CategoryRule {
    label: string;
    resolveDate: DateResolver;
}

const CATEGORY_RULES: Record<string, CategoryRule> = {
    [ItemType.CLOSING_ITEM]: {
        label: ReportCategory.AGUA_POTABLE,
        resolveDate: (r) => r.started_at || r.received_at
    },
    [ItemType.SHARED_ITEMS]: {
        label: ReportCategory.OBRAS,
        resolveDate: (r) => r.civil_work_at || r.started_at || r.received_at
    },
    // Fallback for mapped values if they exist in DB (Legacy/Safety)
    [ReportCategory.AGUA_POTABLE]: {
        label: ReportCategory.AGUA_POTABLE,
        resolveDate: (r) => r.started_at || r.received_at
    },
    [ReportCategory.OBRAS]: {
        label: ReportCategory.OBRAS,
        resolveDate: (r) => r.civil_work_at || r.started_at || r.received_at
    }
};

export class ReportService {
    private otRepository: OtRepository;

    constructor() {
        this.otRepository = new OtRepository();
    }

    async generatePaymentStatusExcel(startDate: string, endDate: string, states?: string[] | null): Promise<ExcelJS.Buffer> {
        // 1. Fetch Current Period Data
        // Failsafe: If states is null/empty/undefined, default to 'POR_PAGAR'
        const effectiveStates = (states && states.length > 0) ? states : ['POR_PAGAR'];

        const filters: OtFilter = {
            startDate,
            endDate,
            status: effectiveStates, // Pass array or single string (repository handles both, but now we pass array likely)
            dateField: 'execution_date' // Use calculated fallback date
        };
        const rows = await this.otRepository.getReportData(filters) as ReportRow[];

        // 2. Fetch Backlog Data (Before startDate)
        const backlogRows = await this.otRepository.getBacklogReportData(startDate) as ReportRow[];

        // 3. Create Workbook
        const workbook = new ExcelJS.Workbook();

        // 4. Add Summary Sheet (First to be active)
        this.addSummarySheet(workbook, rows, backlogRows, startDate, endDate);

        // 5. Add Current Rate Detail Sheet
        this.addDetailSheet(workbook, 'Detalle OT', rows);

        // 6. Add Backlog Sheet (Conditional)
        // [MODIFIED] SALDO_ANTERIOR Temporarily disabled per requirement
        /*
        if (backlogRows.length > 0) {
            this.addDetailSheet(workbook, 'SALDO_ANTERIOR', backlogRows, 'FFFF0000'); // Red Tab
        }
        */

        return await workbook.xlsx.writeBuffer();
    }

    private addDetailSheet(workbook: ExcelJS.Workbook, sheetName: string, rows: ReportRow[], tabColorARGB?: string) {
        const worksheet = workbook.addWorksheet(sheetName);
        if (tabColorARGB) {
            worksheet.properties.tabColor = { argb: tabColorARGB };
        }

        // Define Columns
        worksheet.columns = [
            { header: 'OT', key: 'ot', width: 15 },
            { header: 'DIRECCION', key: 'street', width: 30 },
            { header: 'NUMERAL', key: 'number', width: 10 },
            { header: 'COMUNA', key: 'commune', width: 20 },
            { header: 'MÓVIL', key: 'movil', width: 15 },
            { header: 'FECHA_EJECUCIÓN', key: 'date', width: 15 },
            { header: 'REPARACIÓN', key: 'description', width: 40 },
            { header: 'CANTIDAD', key: 'quantity', width: 10 },
            { header: 'VALOR_UNITARIO', key: 'unit_value', width: 15, style: { numFmt: '#,##0' } },
            { header: 'TOTAL', key: 'total', width: 15, style: { numFmt: '#,##0' } },
            { header: 'CATEGORIA_TAREA', key: 'category', width: 20 },
        ];

        // Style Header
        worksheet.getRow(1).font = { bold: true };

        let grandTotal = 0;

        // Add Rows
        rows.forEach(row => {
            const quantity = Number(row.quantity) || 0;
            const unitValue = Number(row.item_value) || 0;
            const total = quantity * unitValue;
            grandTotal += total;

            // Strategy Pattern Implementation
            const rule = CATEGORY_RULES[row.item_type];

            // Resolve Category Label (default to raw type if no rule)
            const categoria = rule ? rule.label : (row.item_type || '');

            // Resolve Date (default to effective_date if no rule or resolution fails)
            let displayDate = row.effective_date;
            if (rule) {
                const resolved = rule.resolveDate(row);
                if (resolved) {
                    displayDate = resolved;
                }
            } else {
                // Redundant safety check: if no rule, default logic implies effective_date
                // but we can add specific handling if needed.
                // Current default is 'effective_date' initialized above.
            }

            worksheet.addRow({
                ot: row.external_ot_id || '',
                street: row.street,
                number: row.number_street || '',
                commune: row.commune,
                movil: row.movil_code || '',
                date: displayDate,
                category: categoria,
                description: row.item_description,
                quantity: quantity,
                unit_value: unitValue,
                total: total
            });
        });

        // Add Grand Total Row
        const totalRow = worksheet.addRow({
            unit_value: 'TOTAL',
            total: grandTotal
        });
        totalRow.font = { bold: true };
        totalRow.commit();

        // Format Currency Columns
        ['unit_value', 'total'].forEach(key => {
            worksheet.getColumn(key).numFmt = '"$"#,##0;[Red]\\-"$"#,##0';
        });

        // Match Header Style (Deep Ocean)
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White Font
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0070C0' } // Dark Blue
        };

        // Zebra Striping
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1 && rowNumber % 2 === 0) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFDDEBF7' } // Light Blue
                };
            }
        });
    }

    private addSummarySheet(workbook: ExcelJS.Workbook, rows: ReportRow[], backlogRows: ReportRow[], startDate: string, endDate: string) {
        const summarySheet = workbook.addWorksheet('RESUMEN');

        // --- 1. HEADER SECTION (Executive Style) ---
        summarySheet.mergeCells('A1:F1');
        const titleCell = summarySheet.getCell('A1');
        titleCell.value = 'RESUMEN EJECUTIVO - ESTADO DE PAGO';
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF132F4C' } // Deep Ocean
        };

        summarySheet.mergeCells('A2:F2');
        const dateCell = summarySheet.getCell('A2');
        dateCell.value = `Periodo: ${startDate} al ${endDate}`;
        dateCell.font = { name: 'Arial', size: 11, italic: true };
        dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // --- IN-MEMORY AGGREGATION ---

        interface MovilStats { otSet: Set<string>; netTotal: number }
        interface ItemStats { quantity: number; netTotal: number }

        const movilMap = new Map<string, MovilStats>();
        const itemMap = new Map<string, ItemStats>();

        let currentPeriodTotal = 0;
        let backlogTotal = 0;
        const totalUniqueOTs = new Set<string>();

        // Process Current Period
        rows.forEach(row => {
            const qty = Number(row.quantity) || 0;
            const val = Number(row.item_value) || 0;
            const total = qty * val;

            currentPeriodTotal += total;
            if (row.external_ot_id) totalUniqueOTs.add(row.external_ot_id);

            // Movil Aggregation
            const movilKey = row.movil_code || 'S/M';
            if (!movilMap.has(movilKey)) {
                movilMap.set(movilKey, { otSet: new Set(), netTotal: 0 });
            }
            const mStats = movilMap.get(movilKey)!;
            if (row.external_ot_id) mStats.otSet.add(row.external_ot_id);
            mStats.netTotal += total;

            // Item Aggregation
            const itemKey = row.item_description || 'Sin Descripción';
            if (!itemMap.has(itemKey)) {
                itemMap.set(itemKey, { quantity: 0, netTotal: 0 });
            }
            const iStats = itemMap.get(itemKey)!;
            iStats.quantity += qty;
            iStats.netTotal += total;
        });

        // Calculate Backlog Total
        backlogRows.forEach(row => {
            const qty = Number(row.quantity) || 0;
            const val = Number(row.item_value) || 0;
            const total = qty * val;
            backlogTotal += total;
        });

        // --- 2. KPI CARDS (Row 5) ---
        // Current Period
        const kpiPeriodTitle = summarySheet.getCell('B5');
        kpiPeriodTitle.value = 'TOTAL PERIODO ACTUAL';
        kpiPeriodTitle.font = { bold: true, color: { argb: 'FF808080' } };

        const kpiPeriodValue = summarySheet.getCell('B6');
        kpiPeriodValue.value = currentPeriodTotal;
        kpiPeriodValue.numFmt = '"$"#,##0';
        kpiPeriodValue.font = { size: 14, bold: true };
        kpiPeriodValue.alignment = { horizontal: 'left' };

        // Backlog
        const kpiBacklogTitle = summarySheet.getCell('B8');
        kpiBacklogTitle.value = 'TOTAL SALDO ANTERIOR';
        kpiBacklogTitle.font = { bold: true, color: { argb: 'FFFF0000' } }; // Red

        const kpiBacklogValue = summarySheet.getCell('B9');
        kpiBacklogValue.value = backlogTotal;
        kpiBacklogValue.numFmt = '"$"#,##0';
        kpiBacklogValue.font = { size: 14, bold: true, color: { argb: 'FFFF0000' } };
        kpiBacklogValue.alignment = { horizontal: 'left' };

        // Total OTs (Current Period)
        const kpiOtTitle = summarySheet.getCell('D5');
        kpiOtTitle.value = 'CANTIDAD TOTAL OTs';
        kpiOtTitle.font = { bold: true, color: { argb: 'FF808080' } };

        const kpiOtValue = summarySheet.getCell('D6');
        kpiOtValue.value = totalUniqueOTs.size;
        kpiOtValue.font = { size: 14, bold: true };
        kpiOtValue.alignment = { horizontal: 'left' };

        // Grand Total
        const kpiGrandTitle = summarySheet.getCell('D8');
        kpiGrandTitle.value = 'GRAN TOTAL A PAGAR';
        kpiGrandTitle.font = { bold: true, color: { argb: 'FF000000' } };

        const kpiGrandValue = summarySheet.getCell('D9');
        kpiGrandValue.value = currentPeriodTotal + backlogTotal;
        kpiGrandValue.numFmt = '"$"#,##0';
        kpiGrandValue.font = { size: 16, bold: true, underline: true };
        kpiGrandValue.alignment = { horizontal: 'left' };

        // Card Styling
        ['B5', 'B6', 'B8', 'B9', 'D5', 'D6', 'D8', 'D9'].forEach(cellRef => {
            summarySheet.getCell(cellRef).border = {
                top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
            };
        });

        // --- 3. TABLES SECTION ---
        let currentRow = 12; // Adjusted for extra KPI rows

        // --- RENDER MÓVILES TABLE ---
        const movilHeaderRow = summarySheet.getRow(currentRow);


        summarySheet.columns = [
            { key: 'col1', width: 25 },
            { key: 'col2', width: 15 },
            { key: 'col3', width: 20 },
            { key: 'col4', width: 20 },
            { key: 'col5', width: 20 },
            { key: 'col6', width: 20 },
        ];

        movilHeaderRow.getCell(1).value = 'Móvil';
        movilHeaderRow.getCell(2).value = 'Cantidad OTs';
        movilHeaderRow.getCell(3).value = 'Total Neto';

        [1, 2, 3].forEach(colIdx => {
            const cell = movilHeaderRow.getCell(colIdx);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4DB6AC' } }; // Teal
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center' };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });

        currentRow++;

        let movilGrandTotal = 0;
        const sortedMovils = Array.from(movilMap.keys()).sort();

        sortedMovils.forEach(key => {
            const stats = movilMap.get(key)!;
            movilGrandTotal += stats.netTotal;

            const row = summarySheet.getRow(currentRow);
            row.getCell(1).value = key;
            row.getCell(2).value = stats.otSet.size || 1;
            row.getCell(3).value = stats.netTotal;
            row.getCell(3).numFmt = '"$"#,##0;[Red]\\-"$"#,##0';

            [1, 2, 3].forEach(c => {
                row.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            });

            currentRow++;
        });

        const movilTotalRow = summarySheet.getRow(currentRow);
        movilTotalRow.getCell(1).value = 'TOTAL';
        movilTotalRow.getCell(3).value = movilGrandTotal;
        movilTotalRow.getCell(3).numFmt = '"$"#,##0;[Red]\\-"$"#,##0';
        movilTotalRow.font = { bold: true };
        [1, 2, 3].forEach(c => {
            movilTotalRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });

        currentRow += 3;

        // --- RENDER ITEMS TABLE ---
        const itemHeaderRow = summarySheet.getRow(currentRow);
        itemHeaderRow.getCell(1).value = 'Ítem';
        itemHeaderRow.getCell(2).value = 'Cantidad Ejecutada';
        itemHeaderRow.getCell(3).value = 'Total Neto';

        [1, 2, 3].forEach(colIdx => {
            const cell = itemHeaderRow.getCell(colIdx);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4DB6AC' } }; // Teal
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center' };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });

        currentRow++;

        let itemGrandTotal = 0;
        const sortedItems = Array.from(itemMap.keys()).sort();

        sortedItems.forEach(key => {
            const stats = itemMap.get(key)!;
            itemGrandTotal += stats.netTotal;

            const row = summarySheet.getRow(currentRow);
            row.getCell(1).value = key;
            row.getCell(2).value = stats.quantity;
            row.getCell(3).value = stats.netTotal;
            row.getCell(3).numFmt = '"$"#,##0;[Red]\\-"$"#,##0';

            [1, 2, 3].forEach(c => {
                row.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            });

            currentRow++;
        });

        const itemTotalRow = summarySheet.getRow(currentRow);
        itemTotalRow.getCell(1).value = 'TOTAL';
        itemTotalRow.getCell(3).value = itemGrandTotal;
        itemTotalRow.getCell(3).numFmt = '"$"#,##0;[Red]\\-"$"#,##0';
        itemTotalRow.font = { bold: true };
        [1, 2, 3].forEach(c => {
            itemTotalRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });
    }
}
