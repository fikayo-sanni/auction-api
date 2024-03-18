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
  };
};

export default registerAs('app', getAppConfig);
