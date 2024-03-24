import { IsEthereumAddress } from 'class-validator';
import { IsFutureTimestamp } from 'src/shared/decorator/futuretimestamp.decorator';
import { IsTimestamp } from 'src/shared/decorator/timestamp.decorator';

export class DeployContractDto {
  @IsTimestamp()
  @IsFutureTimestamp()
  time: number;

  @IsEthereumAddress()
  beneficiary: string;
}
