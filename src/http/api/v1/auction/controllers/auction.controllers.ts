import { Controller, Get, Post, Body, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuctionService } from '../services/auction.service';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { BaseAppController } from 'src/http/api/base/base.controller';

@Controller('api/v1/auction')
export class AuctionController extends BaseAppController {
  constructor(private readonly auctionService: AuctionService) {
    super();
  }

  @UseGuards(AccessTokenGuard)
  @Get('status')
  async getAuctionStatus(@Res() res: Response): Promise<any> {
    const result = await this.auctionService.getAuctionStatus();
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }

  @UseGuards(AccessTokenGuard)
  @Post('end')
  async endAuction(@Res() res: Response) {
    const result = await this.auctionService.endAuction();
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }

  @UseGuards(AccessTokenGuard)
  @Post('bid')
  async submitBid(@Body('amount') amount: number, @Res() res: Response) {
    const result = await this.auctionService.submitBid(amount);
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }

  @UseGuards(AccessTokenGuard)
  @Post('withdraw')
  async withdraw(@Res() res: Response) {
    const result = await this.auctionService.withdraw();
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }
}
