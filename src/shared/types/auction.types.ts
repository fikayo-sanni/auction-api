export interface AuctionStatus {
  beneficiary: string;
  auctionEndTime: number;
  highestBidder: string;
  highestBid: number;
  // ended: boolean;
}

export interface BidEvent {
  bidder: string;
  amount: number;
}

export interface ContractDeployment{
  time: number;
  beneficiary: string;
}

export interface AuctionContract {
  methods: {
    bid(): any;
    auctionEnd(): any;
    beneficiary(): any;
    auctionEndTime(): any;
    highestBidder(): any;
    highestBid(): any;
    withdraw(): any;
    ended(): any;
  };
  events: {
    HighestBidIncreased: {
      returnValues: BidEvent;
    };
    AuctionEnded: {
      returnValues: BidEvent;
    };
  };
}
