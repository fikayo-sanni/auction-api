import { BaseAppController } from 'src/http/api/base/base.controller';
import { AuthService } from '../services/auth.service';
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthSignUpDto } from '../dtos/auth.signup.dto';

@Controller('api/v1/auth')
export class AuthController extends BaseAppController {
  constructor(private authService: AuthService) {
    super();
  }

  @Post('register')
  public async signup(
    @Body(new CustomValidationPipe()) user: AuthSignUpDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.signUp(user);

    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
}
