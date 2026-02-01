export interface OtFilter {
    status?: string | string[];
    startDate?: string;
    endDate?: string;
    search?: string;
    dateField?: 'started_at' | 'finished_at' | 'execution_date';
}
