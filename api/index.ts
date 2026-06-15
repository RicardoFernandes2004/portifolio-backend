import type { VercelRequest, VercelResponse } from '@vercel/node';
import type express from 'express';

let expressApp: express.Express | undefined;

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
): Promise<unknown> {
    if (!expressApp) {
        const { createNestApp } =
            await import('../dist/src/bootstrap.js');
        ({ expressApp } = await createNestApp());
    }
    return expressApp!(req, res);
}
