import { config } from 'dotenv';
import * as path from 'path';

export type ProcessEnv = {
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  NODE_PROVIDER_URL: string;
  CONTRACT_ADDRESS: string;
};

config({
  path: path.join(process.cwd(), '.env'),
});

const processEnvObj = process.env as unknown as ProcessEnv;

export default processEnvObj;
