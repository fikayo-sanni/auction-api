import { IsEthereumAddress, IsNumber } from 'class-validator';

export class DeployContractDto {
  @IsNumber()
  time: number;

  @IsEthereumAddress()
  beneficiary: string;
}
