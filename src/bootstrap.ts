import './env';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { AppModule } from './app.module';

export function parseCorsOrigin(): string[] | boolean {
    const raw = process.env.CORS_ORIGIN?.trim();
    if (!raw || raw === '*') return true;
    return raw
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0);
}

async function configureApp(app: INestApplication): Promise<void> {
    app.enableCors({
        origin: parseCorsOrigin(),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
        maxAge: 86400,
    });

    const config = new DocumentBuilder()
        .setTitle('Portfolio Backend')
        .setDescription(
            'API do portfólio: blog (posts/categories), currículo dinâmico (PDF on-demand) e área administrativa autenticada via JWT.',
        )
        .setVersion('1.0')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            'access-token',
        )
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
}

export async function createNestApp(): Promise<{
    app: INestApplication;
    expressApp: express.Express;
}> {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter);
    await configureApp(app);
    await app.init();
    return { app, expressApp };
}
