import { Test, TestingModule } from '@nestjs/testing';
import { StaffLeaveService } from './staff-leave.service';

describe('StaffLeaveService', () => {
  let service: StaffLeaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffLeaveService],
    }).compile();

    service = module.get<StaffLeaveService>(StaffLeaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
