import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * SHA-256 hex. Usado em segredos que NÓS geramos (token de reset, códigos de
 * backup), que são aleatórios de alta entropia — bcrypt existe para segredos
 * de baixa entropia escolhidos por humanos e aqui só somaria latência.
 * Senha de usuário continua em bcrypt.
 */
export function sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

/** Token opaco url-safe com `bytes` bytes de entropia. */
export function randomToken(bytes: number): string {
    return randomBytes(bytes).toString('base64url');
}

/** Comparação de tempo constante entre dois hexes de mesmo tamanho. */
export function safeEqualHex(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
