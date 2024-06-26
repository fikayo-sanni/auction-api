// auction.service.ts
import { Injectable } from '@nestjs/common';
import appConfiguration from 'src/config/envs/app.config';
import { ConfigType } from '@nestjs/config';
import { ResponseMessages } from 'src/constants/ResponseMessages';
import { ServerAppException } from 'src/shared/exceptions/ServerAppException';
import {
  AuctionContract,
  AuctionStatistics,
  AuctionStatus,
  TransactionSender,
} from 'src/shared/types/auction.types';
import Web3, { ContractAbi } from 'web3';
// import { AuctionAbi } from '../abis/auction.abi';
import { AppLogger } from 'src/shared/utils/logger.utils';
import { parseBigInts } from 'src/shared/utils/parser.utils';
// import * as solc from 'solc';
//   import { AuctionAbi } from '../abis/auction.abi';
import { DeployContractDto } from '../dtos/auction.deploy.dto';
import { SimpleAuction } from '../contracts/auction.contract';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { NotFoundAppException } from 'src/shared/exceptions/NotFoundAppException';
import { Contract } from '@prisma/client';
import { NotAuthorizedAppException } from 'src/shared/exceptions/NotAuthorizedAppException';
import { BaseAppException } from 'src/shared/exceptions/BaseAppException';
import { ForbiddenAppException } from 'src/shared/exceptions/ForbiddenAppException';
// import { addMillisecondsToCurrent } from 'src/shared/utils/time.utils';
import { UsersService } from '../../users/services/users.service';
@Injectable()
export class AuctionService {
  protected appConfig: ConfigType<typeof appConfiguration>;
  private readonly web3: Web3;
  private auction: Contract;
  private contract: AuctionContract;
  private readonly contractSource: string;

  constructor(
    private readonly appLogger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
  ) {
    this.appConfig = appConfiguration();
    this.web3 = new Web3(
      `${this.appConfig.NODE_PROVIDER_URL}${this.appConfig.INFURA_PROJECT_ID}`,
    );
    this.contractSource = SimpleAuction;
  }

  async initiateContract(auction_id: string): Promise<void> {
    const auction = await this.prisma.contract.findUnique({
      where: { id: auction_id },
    });

    if (!auction) {
      throw new NotFoundAppException(ResponseMessages.CONTRACT_NOT_FOUND);
    }

    // expire a bid
    if (Date.now() > new Date(auction.expires_at).getTime()) {
      throw new ForbiddenAppException(ResponseMessages.EXPIRED);
    }

    this.auction = auction;
    const abi = auction.abi as unknown as ContractAbi;
    const address = auction.contract_address;

    this.contract = new this.web3.eth.Contract(
      abi,
      address,
    ) as unknown as AuctionContract;
  }

  async getSenderInfo(): Promise<TransactionSender> {
    try {
      const add = await this.web3.eth.accounts.wallet.add(
        this.appConfig.ACCOUNT_PRIVATE_KEY,
      );

      return {
        from: add[0].address,
      };
    } catch (e) {
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async getAuctionStatistics(auction_id: string): Promise<AuctionStatistics> {
    try {
      const total_volume = await this.prisma.history.count({
        where: {
          auction_id,
        },
      });

      const bids = await this.prisma.history.findMany({
        where: {
          auction_id,
        },
        select: {
          bid: true,
        },
      });

      const total_value = bids.reduce(
        (total, bid) => total + parseFloat(bid.bid),
        0,
      );

      return { total_value, total_volume };
    } catch (e) {
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async fetchUserWallet(user_id: string): Promise<string> {
    try {
      const user = await this.userService.findById(user_id);

      if (!user || !user.wallet_address) {
        throw new NotFoundAppException(ResponseMessages.WALLET_NOT_FOUND);
      }

      return user.wallet_address;
    } catch (e) {
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async getAuctionStatus(auction_id: string): Promise<AuctionStatus> {
    try {
      await this.initiateContract(auction_id);
      const [beneficiary, auctionEndTime, highestBidder, highestBid] =
        await Promise.all([
          this.contract.methods.beneficiary().call(),
          this.contract.methods.auctionEndTime().call(),
          this.contract.methods.highestBidder().call(),
          this.contract.methods.highestBid().call(),
          this,
        ]);
      return parseBigInts({
        beneficiary,
        auctionEndTime,
        highestBidder,
        highestBid,
      }) as unknown as AuctionStatus;
    } catch (e) {
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async getAuctionHistory(auction_id: string) {
    try {
      return this.prisma.contract.findUnique({
        where: { id: auction_id },
        include: {
          bids: true,
          withdrawals: true,
        },
      });
    } catch (e) {
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async submitBid(
    auction_id: string,
    user_id: string,
    amount: number,
  ): Promise<void> {
    try {
      await this.initiateContract(auction_id);
      const wallet_address = await this.fetchUserWallet(user_id);
      await this.contract.methods
        .bid(wallet_address)
        .send({ value: amount, ...(await this.getSenderInfo()) });
      await this.prisma.history.create({
        data: {
          bid: String(amount),
          user: {
            connect: { id: user_id },
          },
          auction: { connect: { id: auction_id } },
        },
      });
    } catch (e) {
      this.appLogger.logError(e);
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async endAuction(auction_id: string, user_id: string): Promise<void> {
    try {
      await this.initiateContract(auction_id);

      if (this.auction.user_id !== user_id) {
        throw new NotAuthorizedAppException(ResponseMessages.ACCESS_DENIED);
      }
      await this.contract.methods.auctionEnd().send(await this.getSenderInfo());

      await this.prisma.contract.update({
        where: { id: auction_id },
        data: { expires_at: new Date() },
      });
    } catch (e) {
      this.appLogger.logError(e);
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async withdraw(auction_id: string, user_id: string): Promise<void> {
    try {
      await this.initiateContract(auction_id);
      await this.contract.methods
        .withdraw(await this.fetchUserWallet(user_id))
        .send(await this.getSenderInfo());

      await this.prisma.withdrawals.create({
        data: {
          user: {
            connect: { id: user_id },
          },
          auction: { connect: { id: auction_id } },
        },
      });
    } catch (e) {
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async deployContract(args: DeployContractDto): Promise<Contract> {
    try {
      console.log(args);
      /*const input = {
        language: 'Solidity',
        sources: {
          'SimpleAuction.sol': {
            content: this.contractSource,
          },
        },
        settings: {
          outputSelection: {
            '*': {
              '*': ['*'],
            },
          },
        },
      };

      // Compile the contract
      const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
      const metadata =
        compiledContract.contracts['SimpleAuction.sol']['SimpleAuction']
          .metadata;
      const bytecode =
        compiledContract.contracts['SimpleAuction.sol']['SimpleAuction'].evm
          .bytecode.object;
      const abi = JSON.parse(metadata).output.abi;

      // Deploy the contract
      const accounts = await this.web3.eth.getAccounts();
      const contract = new this.web3.eth.Contract(abi);
      this.appLogger.logInfo('accounts', accounts);

      const deployedContract = await contract
        .deploy({
          data: '0x' + bytecode,
          arguments: [args.time, args.beneficiary],
        })
        .send({
          ...(await this.getSenderInfo()),
          gas: '1500000',
          gasPrice: '30000000000',
        });

      return this.prisma.contract.create({
        data: {
          user: { connect: { id: args.user_id } },
          contract_address: deployedContract.options.address,
          abi,
          expires_at: addMillisecondsToCurrent(args.time),
        },
      });*/
      // return deployedContract.options.address;

      return {
        id: '64b6e018-2b40-4604-b5cf-967b8b95a154',
        user_id: '0aa23b40-2ba0-4162-a96d-461002f8005e',
        abi: [
          {
            type: 'constructor',
            inputs: [
              {
                name: '_biddingTime',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: '_beneficiary',
                type: 'address',
                internalType: 'address payable',
              },
            ],
            stateMutability: 'nonpayable',
          },
          {
            name: 'AuctionEnded',
            type: 'event',
            inputs: [
              {
                name: 'winner',
                type: 'address',
                indexed: false,
                internalType: 'address',
              },
              {
                name: 'amount',
                type: 'uint256',
                indexed: false,
                internalType: 'uint256',
              },
            ],
            anonymous: false,
          },
          {
            name: 'HighestBidIncreased',
            type: 'event',
            inputs: [
              {
                name: 'bidder',
                type: 'address',
                indexed: false,
                internalType: 'address',
              },
              {
                name: 'amount',
                type: 'uint256',
                indexed: false,
                internalType: 'uint256',
              },
            ],
            anonymous: false,
          },
          {
            name: 'auctionEnd',
            type: 'function',
            inputs: [],
            outputs: [],
            stateMutability: 'nonpayable',
          },
          {
            name: 'auctionEndTime',
            type: 'function',
            inputs: [],
            outputs: [
              {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
            stateMutability: 'view',
          },
          {
            name: 'beneficiary',
            type: 'function',
            inputs: [],
            outputs: [
              {
                name: '',
                type: 'address',
                internalType: 'address payable',
              },
            ],
            stateMutability: 'view',
          },
          {
            name: 'bid',
            type: 'function',
            inputs: [],
            outputs: [],
            stateMutability: 'payable',
          },
          {
            name: 'highestBid',
            type: 'function',
            inputs: [],
            outputs: [
              {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
            stateMutability: 'view',
          },
          {
            name: 'highestBidder',
            type: 'function',
            inputs: [],
            outputs: [
              {
                name: '',
                type: 'address',
                internalType: 'address',
              },
            ],
            stateMutability: 'view',
          },
          {
            name: 'withdraw',
            type: 'function',
            inputs: [],
            outputs: [
              {
                name: '',
                type: 'bool',
                internalType: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        contract_address: '0x5AF6B088D20446B3f36F77FCa54Fd854feA6Abb0',
        created_at: new Date('2024-03-24T16:37:01.648Z'),
        expires_at: new Date('2024-03-25T06:30:21.644Z'),
        updated_at: new Date('2024-03-24T16:37:01.648Z'),
      };
    } catch (e) {
      console.log('Jumbo!!!', e);
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }
}
