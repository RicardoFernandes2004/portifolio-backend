import '../src/env';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/service/users/users.service';

async function main() {
    const logger = new Logger('seed');

    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !email || !password) {
        throw new Error(
            'ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment',
        );
    }

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn', 'log'],
    });

    try {
        const usersService = app.get(UsersService);

        const existing = await usersService.findByEmailOrUsername(email, username);
        if (existing) {
            logger.log(
                `Admin already exists (id=${existing.id}, username=${existing.username}). Skipping.`,
            );
            return;
        }

        const created = await usersService.create({ username, email, password });
        logger.log(`Admin created (id=${created.id}, username=${created.username}).`);
    } finally {
        await app.close();
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exit(1);
    });
