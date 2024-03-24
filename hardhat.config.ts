import { config as dotEnvConfig } from 'dotenv';
import { HardhatUserConfig } from 'hardhat/types';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';

dotEnvConfig();

const config: HardhatUserConfig = {
  networks: {
    sepholia: {
      url: `https://sepholia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.ACCOUNT_PRIVATE_KEY}`],
    },
  },
  solidity: {
    version: '0.8.0',
  },
};

export default config;
