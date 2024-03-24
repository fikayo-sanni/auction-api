import { registerAs } from '@nestjs/config';
import processEnvObj from '.';

const getAppConfig = () => {
  let nodeEnv = String(processEnvObj.NODE_ENV).toLowerCase();
  if (!['development', 'staging', 'production', 'test'].includes(nodeEnv)) {
    nodeEnv = 'development';
  }

  return {
    NODE_ENV: nodeEnv as 'development' | 'staging' | 'production' | 'test',
    PORT: parseInt(String(processEnvObj.PORT), 10) || 5011,
    JWT_SECRET: String(processEnvObj.JWT_SECRET),
    JWT_REFRESH_SECRET: String(processEnvObj.JWT_REFRESH_SECRET),
    NODE_PROVIDER_URL: String(processEnvObj.NODE_PROVIDER_URL),
    INFURA_PROJECT_ID: String(processEnvObj.INFURA_PROJECT_ID),
    ACCOUNT_PRIVATE_KEY: String(processEnvObj.ACCOUNT_PRIVATE_KEY),
  };
};

export default registerAs('app', getAppConfig);
