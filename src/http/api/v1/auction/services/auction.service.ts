// auction.service.ts
import { Injectable } from '@nestjs/common';
import appConfiguration from 'src/config/envs/app.config';
import { ConfigType } from '@nestjs/config';
import { ResponseMessages } from 'src/constants/ResponseMessages';
import { ServerAppException } from 'src/shared/exceptions/ServerAppException';
import { AuctionContract, AuctionStatus } from 'src/shared/types/auction.types';
import Web3, { ContractAbi } from 'web3';
// import { AuctionAbi } from '../abis/auction.abi';
import { AppLogger } from 'src/shared/utils/logger.utils';
import { parseBigInts } from 'src/shared/utils/parser.utils';
import * as solc from 'solc';
//   import { AuctionAbi } from '../abis/auction.abi';
import { DeployContractDto } from '../dtos/auction.deploy.dto';
import { SimpleAuction } from '../contracts/auction.contract';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { NotFoundAppException } from 'src/shared/exceptions/NotFoundAppException';
import { Contract } from '@prisma/client';
import { NotAuthorizedAppException } from 'src/shared/exceptions/NotAuthorizedAppException';
import { BaseAppException } from 'src/shared/exceptions/BaseAppException';
import { ForbiddenAppException } from 'src/shared/exceptions/ForbiddenAppException';
import { addMillisecondsToCurrent } from 'src/shared/utils/time.utils';
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
  ) {
    // this.contractAddress = this.appConfig.CONTRACT_ADDRESS
    this.appConfig = appConfiguration();
    this.web3 = new Web3(this.appConfig.NODE_PROVIDER_URL);
    // const abi = AuctionAbi;
    /*this.contract = new this.web3.eth.Contract(
      abi,
      this.appConfig.CONTRACT_ADDRESS,
    ) as unknown as AuctionContract;*/

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

  async submitBid(
    auction_id: string,
    user_id: string,
    amount: number,
  ): Promise<void> {
    try {
      await this.initiateContract(auction_id);
      await this.contract.methods.bid().send({ value: amount });
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
      await this.contract.methods.auctionEnd().send();
    } catch (e) {
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async withdraw(auction_id: string): Promise<void> {
    try {
      await this.initiateContract(auction_id);
      await this.contract.methods.withdraw().send();
    } catch (e) {
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async deployContract(args: DeployContractDto): Promise<Contract> {
    try {
      const add = await this.web3.eth.accounts.wallet.add(
        this.appConfig.ACCOUNT_PRIVATE_KEY,
      );
      this.appLogger.logInfo('ERROR ===>>>', add);
      const input = {
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

      // const output = JSON.parse(solc.compile(JSON.stringify(input)));

      //this.appLogger.logInfo('Options!!!!', output);

      // Compile the contract
      const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
      const metadata =
        compiledContract.contracts['SimpleAuction.sol']['SimpleAuction']
          .metadata;
      this.appLogger.logInfo('MAIN!!!', JSON.parse(metadata).output.abi);
      //const artifact = compiledContract.contracts['SimpleAuction'];
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
          from: add[0].address,
          gas: '1500000',
          gasPrice: '30000000000',
        });

      this.appLogger.logInfo(
        'Contract deployed at address:',
        deployedContract.options.address,
      );

      return this.prisma.contract.create({
        data: {
          user: { connect: { id: args.user_id } },
          contract_address: deployedContract.options.address,
          abi,
          expires_at: addMillisecondsToCurrent(args.time),
        },
      });
      // return deployedContract.options.address;
    } catch (e) {
      this.appLogger.logError(e);
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }
}
