import { HttpException } from '@nestjs/common';
import { ResponseStatusCodeConst } from '../../constants/ResponseStatusCodes';

type HttpExceptionConstructorParams = ConstructorParameters<
  typeof HttpException
>;

export class BaseAppException extends HttpException {
  statusCode: ResponseStatusCodeConst;
  translateMessage: boolean;
  devMessage?: unknown;

  constructor(
    message: HttpExceptionConstructorParams[0],
    status: HttpExceptionConstructorParams[1],
    statusCode: ResponseStatusCodeConst,
    translateMessage: boolean,
    devMessage: string | unknown | undefined = undefined,
  ) {
    super(message, status);
    this.statusCode = statusCode;
    this.translateMessage = translateMessage;
    this.devMessage =
      typeof devMessage === 'object'
        ? JSON.stringify(devMessage)
        : devMessage
          ? devMessage.toString()
          : devMessage;
  }
}
