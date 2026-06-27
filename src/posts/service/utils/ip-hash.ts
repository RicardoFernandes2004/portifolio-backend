import { createHash } from 'crypto';

const FALLBACK_IP = '0.0.0.0';

export function hashIp(ip: string | undefined | null): string {
    const salt = process.env.COMMENT_IP_SALT ?? 'portifolio-default-salt';
    const normalized = (ip ?? FALLBACK_IP).trim() || FALLBACK_IP;
    return createHash('sha256').update(`${salt}:${normalized}`).digest('hex');
}
