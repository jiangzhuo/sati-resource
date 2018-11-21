import { hostname } from "os";
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: 'https://f788de537d2648cb96b4b9f5081165c1@sentry.io/1318216', serverName: hostname() });
import './hackNestLogger';
// import { Transport } from '@nestjs/common/enums/transport.enum';
import { NestFactory } from '@nestjs/core';
// import { join } from 'path';

import { ResourceModule } from './resource.module';



async function bootstrap() {
    // const app = await NestFactory.createMicroservice(ResourceModule.forRoot({ i18n: 'zh-CN' }), {
    //     // logger: new MyLogger(),
    //     transport: Transport.GRPC,
    //     options: {
    //         url: '0.0.0.0' + ':50052',
    //         package: 'sati_module_resource',
    //         protoPath: 'resource.module.proto',
    //         loader: {
    //             includeDirs: [join(__dirname, 'protobufs')],
    //             arrays: true,
    //             keepCase: true
    //             // longs: String,
    //             // enums: String,
    //             // defaults: true,
    //             // oneofs: true
    //         }
    //     }
    // });

    // await app.listenAsync();

    const app = await NestFactory.createApplicationContext(ResourceModule.forRoot());
}

bootstrap();
