import { BaseAppController } from 'src/http/api/base/base.controller';
import { UsersService } from '../services/users.service';
import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { AuthRequest } from 'src/shared/types/auth.types';
import { CustomValidationPipe } from 'src/shared/pipes/customValidation.pipe';
import { WalletUserDto } from '../dto/users.wallet.dto';

@Controller('api/v1/user')
@UseGuards(AccessTokenGuard)
export class UsersController extends BaseAppController {
  constructor(private readonly userService: UsersService) {
    super();
  }

  @Get('me')
  async getSessionUser(@Req() req: AuthRequest, @Res() res: Response) {
    const result = await this.userService.findById(req.user.sub);
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }

  @Post('user/wallet')
  async addUserWallet(
    @Body(new CustomValidationPipe()) wallet: WalletUserDto,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    const result = await this.userService.addUserWallet(
      req.user.sub,
      wallet.wallet_address,
    );

    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }
}
