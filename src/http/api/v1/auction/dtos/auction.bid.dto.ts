import { IsNumber } from 'class-validator';

export class BidContractDto {
  @IsNumber()
  amount: number;
}
