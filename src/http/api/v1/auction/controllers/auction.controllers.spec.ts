import { Test, TestingModule } from '@nestjs/testing';
import { AuctionController } from './auction.controllers';
import { AuctionService } from '../services/auction.service';
import { Response } from 'express';
import { AuctionStatus } from 'src/shared/types/auction.types';
import { AppLogger } from 'src/shared/utils/AppLogger';

jest.mock('../services/auction.service');

describe('AuctionController', () => {
  let controller: AuctionController;
  let auctionService: AuctionService;

  const mockResponse = {
    send: jest.fn(),
    status: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuctionController],
      providers: [AuctionService, AppLogger],
    }).compile();

    controller = module.get<AuctionController>(AuctionController);
    auctionService = module.get<AuctionService>(AuctionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAuctionStatus', () => {
    it('should return auction status', async () => {
      const mockStatus = {
        beneficiary: '0xe48f2E87f5535ABE82b499E2a501Ce207231cEdA',
        auctionEndTime: '1711266848',
        highestBidder: '0x0000000000000000000000000000000000000000',
        highestBid: '0',
      } as unknown as AuctionStatus;
      jest
        .spyOn(auctionService, 'getAuctionStatus')
        .mockResolvedValue(mockStatus);

      const result = await controller.getAuctionStatus(mockResponse);

      expect(result).toBe(mockResponse);
      // Add more assertions based on specific logic and expectations
    });
  });

  describe('endAuction', () => {
    it('should end the auction', async () => {
      jest.spyOn(auctionService, 'endAuction').mockResolvedValue();

      const result = await controller.endAuction(mockResponse);

      expect(result).toBe(mockResponse);
      // Add more assertions based on specific logic and expectations
    });
  });

  describe('submitBid', () => {
    it('should submit a bid', async () => {
      const amount = 100; // Example amount

      jest.spyOn(auctionService, 'submitBid').mockResolvedValue();
      const result = await controller.submitBid(amount, mockResponse);

      expect(result).toBe(mockResponse);
      // Add more assertions based on specific logic and expectations
    });
  });

  describe('withdraw', () => {
    it('should withdraw from the auction', async () => {
      jest.spyOn(auctionService, 'withdraw').mockResolvedValue();

      const result = await controller.withdraw(mockResponse);

      expect(result).toBe(mockResponse);
      // Add more assertions based on specific logic and expectations
    });
  });
});
