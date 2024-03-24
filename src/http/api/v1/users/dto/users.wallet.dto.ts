import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class WalletUserDto {
  @IsEthereumAddress()
  wallet_address: string;

  @IsNotEmpty()
  private_key: string;
}
