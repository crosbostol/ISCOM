import { OtService } from './OtService';
import { IOtRepository } from '../data/repositories/interfaces/IOtRepository';
import { OrdenTrabajoDTO } from '../data/dto/OrdenTrabajoDTO';

// Mock Repository
service = new OtService(mockRepository);
jest.clearAllMocks();
    });

it('should create an OT', async () => {
    const otData: OrdenTrabajoDTO = { street: 'Test St', number_street: '123' };
    const expectedResult = { ot_id: '1', ...otData };
    mockRepository.create.mockResolvedValue(expectedResult);

    const result = await service.createOt(otData);

    expect(mockRepository.create).toHaveBeenCalledWith(otData);
    expect(result).toEqual(expectedResult);
});

it('should find all OTs', async () => {
    const ots = [{ ot_id: '1', street: 'Test St' }];
    mockRepository.findAll.mockResolvedValue(ots);

    const result = await service.getAllOts();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(ots);
});
});
