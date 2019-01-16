import { hostname } from "os";
import * as Sentry from '@sentry/node';
import './hackLogger';
// import { Transport } from '@nestjs/common/enums/transport.enum';
import { NestFactory } from '@nestjs/core';
// import { join } from 'path';

import { Logger } from "@nestjs/common";
// import { ACMClient } from 'acm-client';
import { NacosConfigClient } from 'nacos';

async function bootstrap() {

    const logger = new Logger('sati-resource');
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

    // 初始化ACM或者配置
    const acm = new NacosConfigClient({
    // const acm = new ACMClient({
        endpoint: 'acm.aliyun.com', // acm 控制台查看
        namespace: process.env.ACM_NAMESPACE || '7d2026a8-72a8-4e56-893f-91dfa8ffc207', // acm 控制台查看
        accessKey: process.env.ACM_ACCESS_KEY_ID || 'LTAIhIOInA2pDmga', // acm 控制台查看
        secretKey: process.env.ACM_ACCESS_KEY_SECRET || '9FNpKB1WZpEwxWJbiWSMiCfuy3E3TL', // acm 控制台查看
        requestTimeout: parseInt(process.env.ACM_TIMEOUT) || 6000, // 请求超时时间，默认6s
    });
    await acm.ready();
    // const allConfigs = await acm.getConfigs();
    const allConfigs = [
        { dataId: 'ACM_NAMESPACE', group: 'sati' },
        { dataId: 'ACM_ACCESS_KEY_ID', group: 'sati' },
        { dataId: 'ACM_ACCESS_KEY_SECRET', group: 'sati' },
        { dataId: 'ACM_TIMEOUT', group: 'sati' },
        { dataId: 'SENTRY_DSN', group: 'sati' },
        { dataId: 'ONS_ACCESS_KEY_ID', group: 'sati' },
        { dataId: 'ONS_ACCESS_KEY_SECRET', group: 'sati' },
        { dataId: 'ONS_PRODUCER_GROUP', group: 'sati' },
        { dataId: 'ELASTICSEARCH_HOST', group: 'sati' },
        { dataId: 'ELASTICSEARCH_HTTP_AUTH', group: 'sati' },
        { dataId: 'LOG_LEVEL', group: 'sati' },
        { dataId: 'MONGODB_CONNECTION_STR', group: 'sati' },
        { dataId: 'TRANSPORTER', group: 'sati' }
    ];
    const getAllConfigPromise = [];
    allConfigs.forEach((config) => {
        getAllConfigPromise.push(acm.getConfig(config.dataId, config.group).then((content) => {
            return { config, content };
        }));
    });
    const allConfigResult = await Promise.all(getAllConfigPromise);
    allConfigResult.forEach((res) => {
        process.env[res.config.dataId] = res.content;
        // logger.log(`${res.config.dataId}    -   ${res.content}`);
        acm.subscribe(res.config, (content) => {
            process.env[res.config.dataId] = content;
        });
    });
    logger.log('init config finished');

    Sentry.init({ dsn: process.env.SENTRY_DSN, serverName: hostname() });

    try {
        const { ResourceModule } = require("./resource.module");
        const app = await NestFactory.createApplicationContext(ResourceModule.forRoot());
    } catch (e) {
        logger.error(e);
        throw e;
    }
}

bootstrap();
