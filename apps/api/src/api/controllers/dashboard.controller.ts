import { Request, Response } from 'express';
import { DashboardService } from '../../services/DashboardService';
import { DashboardRepository } from '../../data/repositories/DashboardRepository';

// Manual Dependency Injection
const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);

export const getMonthValue = async (req: Request, res: Response) => {
    try {
        const { date1, date2 } = req.params;
        const result = await dashboardService.getMonthValue(date1, date2);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getTotalOfItem = async (req: Request, res: Response) => {
    try {
        const result = await dashboardService.getTotalOfItem();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const monthlyYield = async (req: Request, res: Response) => {
    try {
        const result = await dashboardService.getMonthlyYield();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
