import React, { useState, useRef } from 'react';
import {
    Box, Stack, TextField, Button, List, ListItem, IconButton, Typography, Autocomplete
} from '@mui/material';
import { useFieldArray, type Control, Controller } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { OTFormValues } from '../../schemas/otSchema';
import { isSharedItem } from '../../../../constants/businessRules';

// Helper
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const parseQty = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const parsed = parseFloat(val.replace(',', '.'));
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

interface OTItemManagerProps {
    control: Control<OTFormValues>;
    movilId: string | null | undefined;
    filterType: 'AGUA POTABLE' | 'OBRAS' | 'RETIRO';
    itemsList: any[];
}

export const OTItemManager: React.FC<OTItemManagerProps> = ({
    control,
    movilId,
    filterType,
    itemsList
}) => {
    const [pendingItem, setPendingItem] = useState<any | null>(null);
    const [pendingQty, setPendingQty] = useState<string>('');
    const itemInputRef = useRef<HTMLInputElement>(null);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const handleAddItem = (assignedMovilId?: string | null) => {
        if (typeof pendingQty !== 'string') return;
        const parsedQty = parseFloat(pendingQty.replace(',', '.'));
        if (!pendingItem || !pendingQty || isNaN(parsedQty) || parsedQty <= 0) return;

        append({
            item_id: pendingItem.item_id,
            quantity: parsedQty,
            assigned_movil_id: assignedMovilId || null
        });

        setPendingItem(null);
        setPendingQty('');
        setTimeout(() => itemInputRef.current?.focus(), 100);
    };

    // Filter items based on type
    const filteredItems = itemsList?.filter((i) => {
        // 1. Direct Match
        if ((i as any).item_type === filterType) return true;
        // 2. Closing Items (except in DEBRIS/RETIRO)
        if ((i as any).item_type === 'CLOSING_ITEM' && filterType !== 'RETIRO') return true;
        // 3. Shared Items Logic
        if ((filterType === 'OBRAS' || filterType === 'RETIRO') && isSharedItem(i.description || '')) return true;
        // 4. Uncategorized
        const isUncategorized = (i as any).item_type !== 'AGUA POTABLE' && (i as any).item_type !== 'OBRAS' && !(i as any).item_type;
        if (isUncategorized) return true;

        return false;
    }) || [];

    return (
        <Box>
            {/* Add Item Section */}
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                <Autocomplete
                    options={filteredItems}
                    getOptionLabel={(option) => `${option.item_id} - ${option.description}`}
                    value={pendingItem}
                    onChange={(_, newValue) => setPendingItem(newValue)}
                    renderOption={(props, option: any) => {
                        const { key, ...otherProps } = props;
                        return (
                            <li key={key} {...otherProps}>
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="body2">{option.description}</Typography>
                                        <Typography variant="caption" color="text.secondary">Cod: {option.item_id}</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                        {formatCurrency(option.item_value || 0)} / un
                                    </Typography>
                                </Box>
                            </li>
                        );
                    }}
                    renderInput={(params) => <TextField {...params} label="Buscar Ítem" inputRef={itemInputRef} />}
                    sx={{ flex: 1 }}
                />
                <TextField
                    label="Cant."
                    value={pendingQty}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9,.]/g, '');
                        setPendingQty(val);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(movilId); } }}
                    sx={{ width: 100 }}
                    inputProps={{ inputMode: 'decimal' }}
                />
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddItem(movilId)}
                    disabled={!pendingItem || !pendingQty}
                    sx={{ height: 56 }}
                >
                    Agregar
                </Button>
            </Stack>

            {/* Items List */}
            <List dense sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: '30vh',
                minHeight: '150px',
                overflowY: 'auto',
                pr: 1,
                display: 'block',
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                    background: (theme) => theme.palette.mode === 'dark' ? '#009688' : '#B0BEC5',
                    borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: (theme) => theme.palette.mode === 'dark' ? '#00796B' : '#78909C',
                }
            }}>
                {fields.map((field, index) => {
                    const currentItem = itemsList?.find(i => Number(i.item_id) === Number(field.item_id));
                    const isMissingFromCatalogue = !currentItem;

                    // STRICT Filter: Only show items assigned to this movil
                    if (field.assigned_movil_id && field.assigned_movil_id !== movilId) return null;

                    // Legacy fallback
                    if (!field.assigned_movil_id && currentItem) {
                        const matchesFilter = (currentItem as any).item_type === filterType;
                        const isClosing = (currentItem as any).item_type === 'CLOSING_ITEM' && filterType !== 'RETIRO';
                        const isShared = (filterType === 'OBRAS' || filterType === 'RETIRO') && isSharedItem((currentItem as any).description || '');
                        const isUncategorized = (currentItem as any).item_type !== 'AGUA POTABLE' && (currentItem as any).item_type !== 'OBRAS' && !(currentItem as any).item_type;

                        if (!matchesFilter && !isClosing && !isShared && !isUncategorized) return null;
                    }

                    if (isMissingFromCatalogue) {
                        return (
                            <ListItem
                                key={field.id}
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => remove(index)} color="error"><DeleteIcon /></IconButton>
                                }
                                sx={{ borderBottom: '1px solid #f0f0f0', bgcolor: 'error.lighter' }}
                            >
                                <Box>
                                    <Typography variant="body2" color="error">Ítem ID {field.item_id} (No encontrado)</Typography>
                                    <Controller
                                        name={`items.${index}.quantity`}
                                        control={control}
                                        render={({ field: qtyField }) => (
                                            <TextField
                                                {...qtyField}
                                                size="small"
                                                label="Cant."
                                                sx={{ width: 80, mt: 1 }}
                                                value={qtyField.value}
                                                onChange={(e) => qtyField.onChange(e.target.value.replace(/[^0-9,.]/g, ''))}
                                                inputProps={{ inputMode: 'decimal' }}
                                            />
                                        )}
                                    />
                                </Box>
                            </ListItem>
                        );
                    }

                    const qty = parseQty(field.quantity);
                    const total = ((currentItem as any).item_value || 0) * qty;

                    return (
                        <ListItem
                            key={field.id}
                            secondaryAction={
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body2" fontWeight="bold" color="primary.main">{formatCurrency(total)}</Typography>
                                    <IconButton edge="end" onClick={() => remove(index)} color="error"><DeleteIcon /></IconButton>
                                </Stack>
                            }
                            sx={{ borderBottom: '1px solid #f0f0f0' }}
                        >
                            <Box>
                                <Typography variant="body2" fontWeight="medium">{(currentItem as any).description}</Typography>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                    <Controller
                                        name={`items.${index}.quantity`}
                                        control={control}
                                        render={({ field: qtyField }) => (
                                            <TextField
                                                {...qtyField}
                                                size="small"
                                                label="Cant."
                                                sx={{ width: 80 }}
                                                value={qtyField.value}
                                                onChange={(e) => qtyField.onChange(e.target.value.replace(/[^0-9,.]/g, ''))}
                                                inputProps={{ inputMode: 'decimal' }}
                                            />
                                        )}
                                    />
                                    <Typography variant="caption" color="text.secondary">× {formatCurrency((currentItem as any).item_value || 0)}</Typography>
                                </Stack>
                            </Box>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};
