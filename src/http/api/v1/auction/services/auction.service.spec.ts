import { Test, TestingModule } from '@nestjs/testing';
import { AuctionService } from './auction.service';
import { ServerAppException } from 'src/shared/exceptions/ServerAppException';
import { AppLogger } from 'src/shared/utils/AppLogger';
import Web3 from 'web3';

jest.mock('web3');

describe('AuctionService', () => {
  let service: AuctionService;
  let web3InstanceMock: jest.Mocked<Web3>;

  beforeEach(async () => {
    web3InstanceMock = {
      eth: {
        Contract: jest.fn(),
      },
    } as unknown as jest.Mocked<Web3>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionService,
        AppLogger,
        {
          provide: Web3,
          useValue: web3InstanceMock,
        },
      ],
    }).compile();

    service = module.get<AuctionService>(AuctionService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuctionStatus', () => {
    it('should return auction status', async () => {
      const expectedStatus = {
        beneficiary: '0x123...',
        auctionEndTime: '1234567890',
        highestBidder: '0x456...',
        highestBid: '100',
      };
      const parsedStatus = {
        beneficiary: BigInt(expectedStatus.beneficiary),
        auctionEndTime: BigInt(expectedStatus.auctionEndTime),
        highestBidder: BigInt(expectedStatus.highestBidder),
        highestBid: BigInt(expectedStatus.highestBid),
      };
      const contractMethodsMock = jest.fn().mockReturnValue(expectedStatus);
      web3InstanceMock.eth.Contract.mockImplementationOnce(() => ({
        methods: {
          beneficiary: contractMethodsMock,
          auctionEndTime: contractMethodsMock,
          highestBidder: contractMethodsMock,
          highestBid: contractMethodsMock,
        },
      }));

      const result = await service.getAuctionStatus();

      expect(result).toEqual(parsedStatus);
      expect(contractMethodsMock).toHaveBeenCalledTimes(4);
    });

    it('should throw ServerAppException if an error occurs', async () => {
      const error = new Error('Failed to fetch auction status');
      web3InstanceMock.eth.Contract.mockImplementationOnce(() => ({
        methods: {
          beneficiary: jest.fn().mockRejectedValueOnce(error),
        },
      }));

      await expect(service.getAuctionStatus()).rejects.toThrowError(
        ServerAppException,
      );
      expect(service['appLogger'].logInfo).toHaveBeenCalledWith(error);
    });
  });

  describe('submitBid', () => {
    it('should submit a bid', async () => {
      const amount = 100;
      const sendMock = jest.fn();
      const sendMethodMock = jest.fn().mockReturnValueOnce({ send: sendMock });
      web3InstanceMock.eth.Contract.mockImplementationOnce(() => ({
        methods: {
          bid: sendMethodMock,
        },
      }));

      await service.submitBid(amount);

      expect(sendMock).toHaveBeenCalledWith({ value: amount });
    });

    it('should throw ServerAppException if an error occurs', async () => {
      const amount = 100;
      const error = new Error('Failed to submit bid');
      web3InstanceMock.eth.Contract.mockImplementationOnce(() => ({
        methods: {
          bid: jest.fn().mockReturnValueOnce({
            send: jest.fn().mockRejectedValueOnce(error),
          }),
        },
      }));

      await expect(service.submitBid(amount)).rejects.toThrowError(
        ServerAppException,
      );
      expect(service['appLogger'].logInfo).toHaveBeenCalledWith(error);
    });
  });

  describe('endAuction', () => {
    it('should end the auction', async () => {
      const sendMock = jest.fn();
      const sendMethodMock = jest.fn().mockReturnValueOnce({ send: sendMock });
      web3InstanceMock.eth.Contract.mockImplementationOnce(() => ({
        methods: {
          auctionEnd: sendMethodMock,
        },
      }));

      await service.endAuction();

      expect(sendMock).toHaveBeenCalled();
    });

    it('should throw ServerAppException if an error occurs', async () => {
      const error = new Error('Failed to end auction');
      web3InstanceMock.eth.Contract.mockImplementationOnce(() => ({
        methods: {
          auctionEnd: jest.fn().mockReturnValueOnce({
            send: jest.fn().mockRejectedValueOnce(error),
          }),
        },
      }));

      await expect(service.endAuction()).rejects.toThrowError(
        ServerAppException,
      );
      expect(service['appLogger'].logInfo).toHaveBeenCalledWith(error);
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds', async () => {
      const sendMock = jest.fn();
      const sendMethodMock = jest.fn().mockReturnValueOnce({ send: sendMock });
      web3InstanceMock.eth.Contract.mockImplementationOnce(() => ({
        methods: {
          withdraw: sendMethodMock,
        },
      }));

      await service.withdraw();

      expect(sendMock).toHaveBeenCalled();
    });

    it('should throw ServerAppException if an error occurs', async () => {
      const error = new Error('Failed to withdraw funds');
      web3InstanceMock.eth.Contract.mockImplementationOnce(() => ({
        methods: {
          withdraw: jest.fn().mockReturnValueOnce({
            send: jest.fn().mockRejectedValueOnce(error),
          }),
        },
      }));

      await expect(service.withdraw()).rejects.toThrowError(ServerAppException);
      expect(service['appLogger'].logInfo).toHaveBeenCalledWith(error);
    });
  });
});
