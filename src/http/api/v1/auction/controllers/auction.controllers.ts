import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { AuctionService } from '../services/auction.service';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { BaseAppController } from 'src/http/api/base/base.controller';
import { AuthRequest } from 'src/shared/types/auth.types';
import { DeployContractDto } from '../dtos/auction.deploy.dto';
import { CustomValidationPipe } from 'src/shared/pipes/customValidation.pipe';
import { BidContractDto } from '../dtos/auction.bid.dto';

@UseGuards(AccessTokenGuard)
@Controller('api/v1/auction')
export class AuctionController extends BaseAppController {
  constructor(private readonly auctionService: AuctionService) {
    super();
  }

  @Get(':auction_id/status')
  async getAuctionStatus(
    @Param('auction_id') auction_id: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<any> {
    const result = await this.auctionService.getAuctionStatus(auction_id);
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }

  @Post(':auction_id/end')
  async endAuction(
    @Param('auction_id') auction_id: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    const result = await this.auctionService.endAuction(
      auction_id,
      req.user.sub,
    );
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }

  @Post(':auction_id/bid')
  async submitBid(
    @Param('auction_id') auction_id: string,
    @Req() req: AuthRequest,
    @Body(new CustomValidationPipe()) { amount }: BidContractDto,
    @Res() res: Response,
  ) {
    const result = await this.auctionService.submitBid(
      auction_id,
      req.user.sub,
      amount,
    );
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }

  @Post('deploy')
  async deployContract(
    @Req() req: AuthRequest,
    @Body(new CustomValidationPipe()) deploy: DeployContractDto,
    @Res() res: Response,
  ) {
    const result = await this.auctionService.deployContract({
      ...deploy,
      user_id: req.user.sub,
    });

    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }

  @Post(':auction_id/withdraw')
  async withdraw(
    @Param('auction_id') auction_id: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    const result = await this.auctionService.withdraw(auction_id);
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }
}
