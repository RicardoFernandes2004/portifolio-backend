import './env';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function parseCorsOrigin(): string[] | boolean {
    const raw = process.env.CORS_ORIGIN?.trim();
    if (!raw || raw === '*') return true;
    return raw
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0);
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

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

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
