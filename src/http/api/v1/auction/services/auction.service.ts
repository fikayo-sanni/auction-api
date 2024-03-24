// auction.service.ts
import { Injectable } from '@nestjs/common';
import appConfiguration from 'src/config/envs/app.config';
import { ConfigType } from '@nestjs/config';
import { ResponseMessages } from 'src/constants/ResponseMessages';
import { ServerAppException } from 'src/shared/exceptions/ServerAppException';
import { AuctionContract, AuctionStatus } from 'src/shared/types/auction.types';
import Web3 from 'web3';
// import { AuctionAbi } from '../abis/auction.abi';
import { AppLogger } from 'src/shared/utils/AppLogger';
import { parseBigInts } from 'src/shared/utils/ParseBigInts';
import * as solc from 'solc';
import * as fs from 'fs';
import { DeployContractDto } from '../dtos/auction.deploy.dto';
import { SimpleAuction } from '../contracts/SimpleAuction.contract';

@Injectable()
export class AuctionService {
  protected appConfig: ConfigType<typeof appConfiguration>;
  private readonly web3: Web3;
  private readonly contract: AuctionContract;
  private readonly contractSource: string;

  constructor(private readonly appLogger: AppLogger) {
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

  async getAuctionStatus(): Promise<AuctionStatus> {
    try {
      const [beneficiary, auctionEndTime, highestBidder, highestBid] =
        await Promise.all([
          this.contract.methods.beneficiary().call(),
          this.contract.methods.auctionEndTime().call(),
          this.contract.methods.highestBidder().call(),
          this.contract.methods.highestBid().call(),
        ]);
      return parseBigInts({
        beneficiary,
        auctionEndTime,
        highestBidder,
        highestBid,
      }) as unknown as AuctionStatus;
    } catch (e) {
      this.appLogger.logInfo(e);
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async submitBid(amount: number): Promise<void> {
    try {
      await this.contract.methods.bid().send({ value: amount });
    } catch (e) {
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async endAuction(): Promise<void> {
    try {
      await this.contract.methods.auctionEnd().send();
    } catch (e) {
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async withdraw(): Promise<void> {
    try {
      await this.contract.methods.withdraw().send();
    } catch (e) {
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async deployContract(args: DeployContractDto): Promise<string> {
    // Compile the contract
    const compiledContract = solc.compile(this.contractSource, 1);
    const bytecode = compiledContract.contracts[':MyContract'].bytecode;
    const abi = JSON.parse(compiledContract.contracts[':MyContract'].interface);

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
  }
}
