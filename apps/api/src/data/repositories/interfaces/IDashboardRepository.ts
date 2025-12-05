import { MonthValueDTO, ItemTotalDTO, MonthlyYieldDTO } from '../../dto/DashboardDTO';

export interface IDashboardRepository {
    getMonthValue(date1: string, date2: string): Promise<MonthValueDTO[]>;
    getTotalOfItem(): Promise<ItemTotalDTO[]>;
    getMonthlyYield(): Promise<MonthlyYieldDTO[]>;
}
