import { ValidationPipe, ArgumentMetadata, Injectable } from '@nestjs/common';
import { Allow } from 'class-validator';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false, // Enforce validation on missing properties
    });
  }

  transform(value: any, metadata: ArgumentMetadata) {
    // Apply the @Allow decorator to allow additional properties
    Allow(value);
    return super.transform(value, metadata);
  }
}
