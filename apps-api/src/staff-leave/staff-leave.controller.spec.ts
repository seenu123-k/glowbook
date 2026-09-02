import { Test, TestingModule } from '@nestjs/testing';
import { StaffLeaveController } from './staff-leave.controller';

describe('StaffLeaveController', () => {
  let controller: StaffLeaveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffLeaveController],
    }).compile();

    controller = module.get<StaffLeaveController>(StaffLeaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
