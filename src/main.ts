import { Transport } from '@nestjs/common/enums/transport.enum';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';

import { ResourceModule } from './resource.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice(ResourceModule.forRoot({ i18n: 'zh-CN' }), {
        transport: Transport.GRPC,
        options: {
            url: '0.0.0.0' + ':50052',
            package: 'sati_module_resource',
            protoPath: 'resource.module.proto',
            loader: {
                includeDirs: [join(__dirname, 'protobufs')],
                arrays: true,
                keepCase: true
                // longs: String,
                // enums: String,
                // defaults: true,
                // oneofs: true
            }
        }
    });

    await app.listenAsync();
}

bootstrap();
