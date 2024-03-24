import { IsEthereumAddress } from 'class-validator';
import { IsTimestamp } from 'src/shared/decorator/timestamp.decorator';

export class DeployContractDto {
  @IsTimestamp()
  time: number;

  @IsEthereumAddress()
  beneficiary: string;
}
