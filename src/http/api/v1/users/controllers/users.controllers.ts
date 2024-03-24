import { BaseAppController } from 'src/http/api/base/base.controller';
import { UsersService } from '../services/users.service';
import { Response } from 'express';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { AuthRequest } from 'src/shared/types/auth.types';

@Controller('api/v1/user')
@UseGuards(AccessTokenGuard)
export class UsersController extends BaseAppController {
  constructor(private readonly userService: UsersService) {
    super();
  }

  @Get('me')
  async getSessionUser(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<any> {
    const result = await this.userService.findById(req.user.sub);
    return this.getHttpResponse().setDataWithKey('data', result).send(res);
  }

  //@Get
}
