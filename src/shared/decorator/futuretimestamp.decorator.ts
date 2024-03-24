import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureTimestamp', async: false })
export class IsFutureTimestampConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    if (!value) {
      return false;
    }
    const currentTimestamp = Date.now();
    return value > currentTimestamp;
  }

  defaultMessage(): string {
    return 'Timestamp must be in the future.';
  }
}

export function IsFutureTimestamp(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureTimestampConstraint,
    });
  };
}
