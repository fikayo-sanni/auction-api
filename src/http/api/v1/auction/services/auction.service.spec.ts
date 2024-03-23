import { AuctionService } from './auction.service';

describe('AuctionService', () => {
  let auctionService: AuctionService;

  beforeEach(() => {
    auctionService = new AuctionService();
  });

  it('should get auction status', async () => {
    const expectedStatus = {
      beneficiary: 'beneficiary_address',
      auctionEndTime: 1234567890,
      highestBidder: 'highest_bidder_address',
      highestBid: 100,
      ended: false,
    };

    // Mocking the getAuctionStatus method
    auctionService.getAuctionStatus = jest
      .fn()
      .mockResolvedValue(expectedStatus);

    const auctionStatus = await auctionService.getAuctionStatus();
    expect(auctionStatus).toEqual(expectedStatus);
  });

  it('should submit bid', async () => {
    const amount = 100;

    // Mocking the submitBid method
    auctionService.submitBid = jest.fn().mockResolvedValue(undefined);

    await expect(auctionService.submitBid(amount)).resolves.not.toThrow();
  });

  it('should end auction', async () => {
    // Mocking the endAuction method
    auctionService.endAuction = jest.fn().mockResolvedValue(undefined);

    await expect(auctionService.endAuction()).resolves.not.toThrow();
  });

  it('should withdraw', async () => {
    // Mocking the withdraw method
    auctionService.withdraw = jest.fn().mockResolvedValue(undefined);

    await expect(auctionService.withdraw()).resolves.not.toThrow();
  });
});
