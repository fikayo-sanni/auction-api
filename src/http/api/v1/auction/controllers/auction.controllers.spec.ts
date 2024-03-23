// auction.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuctionController } from './auction.controllers';
import { AuctionService } from '../services/auction.service';

describe('AuctionController', () => {
  let controller: AuctionController;

  const mockAuctionService = {
    getAuctionStatus: jest.fn(),
    endAuction: jest.fn(),
    submitBid: jest.fn(),
    withdraw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuctionController],
      providers: [{ provide: AuctionService, useValue: mockAuctionService }],
    }).compile();

    controller = module.get<AuctionController>(AuctionController);
  });

  it('should get auction status', async () => {
    const mockResponse = {} as Response;
    const expectedResult = {};
    mockAuctionService.getAuctionStatus.mockResolvedValue(expectedResult);

    const result = await controller.getAuctionStatus(mockResponse);

    expect(result).toEqual(expectedResult);
    expect(mockAuctionService.getAuctionStatus).toHaveBeenCalled();
  });

  it('should end auction', async () => {
    const mockResponse = {} as Response;
    const expectedResult = {};
    mockAuctionService.endAuction.mockResolvedValue(expectedResult);

    const result = await controller.endAuction(mockResponse);

    expect(result).toEqual(expectedResult);
    expect(mockAuctionService.endAuction).toHaveBeenCalled();
  });

  it('should submit bid', async () => {
    const mockResponse = {} as Response;
    const amount = 100;
    const expectedResult = {};
    mockAuctionService.submitBid.mockResolvedValue(expectedResult);

    const result = await controller.submitBid(amount, mockResponse);

    expect(result).toEqual(expectedResult);
    expect(mockAuctionService.submitBid).toHaveBeenCalledWith(amount);
  });

  it('should withdraw', async () => {
    const mockResponse = {} as Response;
    const expectedResult = {};
    mockAuctionService.withdraw.mockResolvedValue(expectedResult);

    const result = await controller.withdraw(mockResponse);

    expect(result).toEqual(expectedResult);
    expect(mockAuctionService.withdraw).toHaveBeenCalled();
  });
});
