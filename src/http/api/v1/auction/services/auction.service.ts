// auction.service.ts
import { Injectable } from '@nestjs/common';
import appConfiguration from 'src/config/envs/app.config';
import { ConfigType } from '@nestjs/config';
import { ResponseMessages } from 'src/constants/ResponseMessages';
import { ServerAppException } from 'src/shared/exceptions/ServerAppException';
import { AuctionContract, AuctionStatus } from 'src/shared/types/auction.types';
import Web3, { ContractAbi } from 'web3';
// import { AuctionAbi } from '../abis/auction.abi';
import { AppLogger } from 'src/shared/utils/AppLogger';
import { parseBigInts } from 'src/shared/utils/ParseBigInts';
import * as solc from 'solc';
//   import { AuctionAbi } from '../abis/auction.abi';
import { DeployContractDto } from '../dtos/auction.deploy.dto';
import { SimpleAuction } from '../contracts/auction.contract';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { NotFoundAppException } from 'src/shared/exceptions/NotFoundAppException';
import { Contract } from '@prisma/client';
import { NotAuthorizedAppException } from 'src/shared/exceptions/NotAuthorizedAppException';
import { BaseAppException } from 'src/shared/exceptions/BaseAppException';
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

  async deployContract(args: DeployContractDto): Promise<string> {
    try {
      // Compile the contract
      const compiledContract = solc.compile(this.contractSource, 1);
      const bytecode = compiledContract.contracts[':SimpleAuction'].bytecode;
      const abi = JSON.parse(
        compiledContract.contracts[':SimpleAuction'].interface,
      );

      // Deploy the contract
      const accounts = await this.web3.eth.getAccounts();
      const contract = new this.web3.eth.Contract(abi);

      const deployedContract = await contract
        .deploy({
          data: '0x' + bytecode,
          arguments: [args.time, args.beneficiary],
        })
        .send({
          from: accounts[0],
          gas: '1500000',
          gasPrice: '30000000000',
        });

      console.log(
        'Contract deployed at address:',
        deployedContract.options.address,
      );
      return deployedContract.options.address;
    } catch (e) {
      if (e instanceof BaseAppException) {
        throw e;
      }
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }
}
