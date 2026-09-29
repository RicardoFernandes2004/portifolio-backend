import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryStorage } from './infra/storage/cloudinary.storage';
import { UploadsController } from './presentation/uploads.controller';
import { STORAGE_PORT } from './service/dtos/upload.ports';
import { UploadsService } from './service/uploads.service';

@Module({
    imports: [AuthModule],
    controllers: [UploadsController],
    // Trocar de provedor (ex: S3) = novo adapter de StoragePort aqui.
    providers: [
        UploadsService,
        { provide: STORAGE_PORT, useClass: CloudinaryStorage },
    ],
})
export class UploadsModule {}
