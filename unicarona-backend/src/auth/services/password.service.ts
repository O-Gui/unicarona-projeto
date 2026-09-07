import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async compare(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, salt, hash] = storedHash.split(':');
    if (algorithm !== 'scrypt' || !salt || !hash) return false;

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const storedKey = Buffer.from(hash, 'hex');
    return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
  }
}
