import * as crypto from 'crypto';
export const hashString = (string: string) => {
  const md5Hash = crypto.createHash('md5');

  md5Hash.update(string);
  const md5Result = md5Hash.digest('hex');

  return md5Result;
};
