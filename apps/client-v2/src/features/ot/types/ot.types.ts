

export interface ImportSummary {
    summary: {
        total_rows_processed: number;
        unique_ots_found: number;
        breakdown_by_type: {
            normal: number;
            additional: number;
        };
    };
    db_operations: {
        created: number;
        updated: number;
    };
    errors: any[];
    warnings?: string[];
}
