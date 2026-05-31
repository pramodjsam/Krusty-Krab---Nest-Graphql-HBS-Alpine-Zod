import * as crypto from 'crypto';

export function buildHash(tag: string, args: Record<string, any> = {}): string {
  const rawKey = JSON.stringify({ tag, args });
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}
