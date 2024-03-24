// src/validators/is-timestamp.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isTimestamp', async: false })
export class IsTimestampConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value) {
      return false;
    }
    return !isNaN(value) && new Date(value).getTime() > 0;
  }

  defaultMessage(): string {
    return 'Timestamp must be a valid number representing milliseconds since the Unix epoch.';
  }
}

export function IsTimestamp(validationOptions?: ValidationOptions) {
  return function (object: Record<string, unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimestampConstraint,
    });
  };
}
