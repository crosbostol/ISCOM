import { OtService } from './OtService';
import { IOtRepository } from '../data/repositories/interfaces/IOtRepository';
import { OrdenTrabajoDTO } from '../data/dto/OrdenTrabajoDTO';

// Mock Repository
const mockRepository: jest.Mocked<IOtRepository> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    getOtTable: jest.fn(),
    getOtTableByState: jest.fn(),
    findByRangeDate: jest.fn(),
    findByState: jest.fn(),
    findByExternalId: jest.fn(),
    findRejected: jest.fn()
};

describe('OtService', () => {
    let service: OtService;

    beforeEach(() => {
        service = new OtService(mockRepository);
        jest.clearAllMocks();
    });

    it('should create an OT', async () => {
        const otData: OrdenTrabajoDTO = { street: 'Test St', number_street: '123' };
        const expectedResult = { id: 1, ...otData }; // Updated to numeric ID
        mockRepository.create.mockResolvedValue(expectedResult);

        const result = await service.createOt(otData);

        expect(mockRepository.create).toHaveBeenCalledWith(otData);
        expect(result).toEqual(expectedResult);
    });

    it('should find all OTs', async () => {
        const ots = [{ id: 1, street: 'Test St' }]; // Updated to numeric ID
        mockRepository.findAll.mockResolvedValue(ots);

        const result = await service.getAllOts();

        expect(mockRepository.findAll).toHaveBeenCalled();
        expect(result).toEqual(ots);
    });
});
