import {
  IsEthereumAddress,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class DeployContractDto {
  @IsNumber()
  time: number;

  @IsEthereumAddress()
  beneficiary: string;

  @IsUUID()
  @IsOptional()
  user_id?: string;
}
