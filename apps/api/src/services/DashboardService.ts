import { IDashboardRepository } from '../data/repositories/interfaces/IDashboardRepository';
import { MonthValueDTO, ItemTotalDTO, MonthlyYieldDTO } from '../data/dto/DashboardDTO';

export class DashboardService {
    constructor(private dashboardRepository: IDashboardRepository) { }

    async getMonthValue(date1: string, date2: string): Promise<MonthValueDTO[]> {
        return this.dashboardRepository.getMonthValue(date1, date2);
    }

    async getTotalOfItem(): Promise<ItemTotalDTO[]> {
        return this.dashboardRepository.getTotalOfItem();
    }

    async getMonthlyYield(): Promise<MonthlyYieldDTO[]> {
        return this.dashboardRepository.getMonthlyYield();
    }
}
