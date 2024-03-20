import { ResponseStatusCodeConst } from '../../constants/ResponseStatusCodes';
import { BaseAppException } from './BaseAppException';
import { HttpStatus } from '@nestjs/common';

type BaseAppExceptionConstructorParams = ConstructorParameters<
  typeof BaseAppException
>;

export class ForbiddenAppException extends BaseAppException {
  constructor(
    message: BaseAppExceptionConstructorParams[0],
    devMessage: BaseAppExceptionConstructorParams[4] = undefined,
    translateMessage = true,
  ) {
    super(
      message,
      HttpStatus.FORBIDDEN,
      ResponseStatusCodeConst.FORBIDDEN,
      translateMessage,
      devMessage,
    );
  }
}
