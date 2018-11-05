import {DynamicModule, Inject, Module, OnModuleInit} from '@nestjs/common';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {MongooseModule} from '@nestjs/mongoose';
import {configure as i18nConfigure} from 'i18n';

import {NotaddGrpcClientFactory} from './grpc/grpc.client-factory';

import {MindfulnessGrpcController} from './controllers/mindfulness.grpc.controller';
import {MindfulnessSchema} from './schemas/mindfulness.schema';
import {MindfulnessService} from './services/mindfulness.service';

import {NatureGrpcController} from './controllers/nature.grpc.controller';
import {NatureSchema} from './schemas/nature.schema';
import {NatureService} from './services/nature.service';

import {WanderGrpcController} from './controllers/wander.grpc.controller';
import {WanderSchema} from './schemas/wander.schema';
import {WanderService} from './services/wander.service';

import {WanderAlbumSchema} from './schemas/wanderAlbum.schema';

import {SceneGrpcController} from './controllers/scene.grpc.controller';
import {SceneSchema} from './schemas/scene.schema';
import {SceneService} from './services/scene.service';

import {MindfulnessRecordSchema} from './schemas/mindfulnessRecord.schema';
import {NatureRecordSchema} from './schemas/natureRecord.schema';
import {WanderRecordSchema} from './schemas/wanderRecord.schema';
import {WanderAlbumRecordSchema} from './schemas/wanderAlbumRecord.schema';

import {UserSchema} from './schemas/user.schema';
import {MindfulnessTransactionSchema} from "./schemas/mindfulnessTransaction.schema";

import {HomeGrpcController} from "./controllers/home.grpc.controller";
import {HomeSchema} from "./schemas/home.schema";
import {HomeService} from "./services/home.service";

import {ElasticsearchModule} from '@nestjs/elasticsearch';
// import { MessageQueueModule } from "./modules/messageQueue.module";
import {OnsModule} from 'nestjs-ali-ons';

const httpclient = require('urllib');
// const Producer = require('ali-ons').Producer;
// const Message = require('ali-ons').Message;
const logger = {
    info() {
    },
    warn() {
    },
    error(...args) {
        console.error(...args);
    },
    debug() {
    },
};


@Module({
    imports: [
        OnsModule.register({
            httpclient,
            accessKeyId: 'LTAIhIOInA2pDmga',
            accessKeySecret: '9FNpKB1WZpEwxWJbiWSMiCfuy3E3TL',
            producerGroup: 'PID_jiangzhuo_home',
            // logger: logger
        }, [{ topic: 'sati_debug', tags: 'mindfulness', type: 'producer' },
            { topic: 'sati_debug', tags: 'nature', type: 'producer' },
            { topic: 'sati_debug', tags: 'wander', type: 'producer' },
            { topic: 'sati_debug', tags: 'wander_album', type: 'producer' }]),
        ElasticsearchModule.register({
            host: 'http://es-cn-mp90uekur0001c8sa.public.elasticsearch.aliyuncs.com:9200',
            httpAuth: 'elastic:Its%queOress2',
            log: 'trace',
        }),
        MongooseModule.forRoot('mongodb://sati:kjhguiyIUYkjh32kh@dds-2zee21d7f4fff2f41890-pub.mongodb.rds.aliyuncs.com:3717,dds-2zee21d7f4fff2f42351-pub.mongodb.rds.aliyuncs.com:3717/sati_resource?replicaSet=mgset-9200157',
            // MongooseModule.forRoot('mongodb://localhost:27017/module_resource',
            { connectionName: 'resource', useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true }),
        MongooseModule.forFeature([{ name: 'Mindfulness', schema: MindfulnessSchema, collection: 'mindfulness' },
            { name: 'Nature', schema: NatureSchema, collection: 'nature' },
            { name: 'Wander', schema: WanderSchema, collection: 'wander' },
            { name: 'WanderAlbum', schema: WanderAlbumSchema, collection: 'wanderAlbum' },
            { name: 'Scene', schema: SceneSchema, collection: 'scene' },
            { name: 'MindfulnessRecord', schema: MindfulnessRecordSchema, collection: 'mindfulnessRecord' },
            {
                name: 'MindfulnessTransaction',
                schema: MindfulnessTransactionSchema,
                collection: 'mindfulnessTransaction'
            },
            { name: 'NatureRecord', schema: NatureRecordSchema, collection: 'natureRecord' },
            { name: 'WanderRecord', schema: WanderRecordSchema, collection: 'wanderRecord' },
            { name: 'WanderAlbumRecord', schema: WanderAlbumRecordSchema, collection: 'wanderAlbumRecord' },
            { name: 'Home', schema: HomeSchema, collection: 'home' }
        ], 'resource'),
        // MongooseModule.forRoot('mongodb://sati:kjhguiyIUYkjh32kh@dds-2zee21d7f4fff2f41890-pub.mongodb.rds.aliyuncs.com:3717,dds-2zee21d7f4fff2f42351-pub.mongodb.rds.aliyuncs.com:3717/sati_user?replicaSet=mgset-9200157',
        // MongooseModule.forRoot('mongodb://localhost:27017/module_user',
        //     { connectionName: 'user', useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true }),
        // MongooseModule.forFeature([{ name: 'User', schema: UserSchema, collection: 'user' }], 'user')
    ],
    controllers: [
        MindfulnessGrpcController,
        NatureGrpcController,
        WanderGrpcController,
        SceneGrpcController,
        HomeGrpcController
    ],
    providers: [
        MindfulnessService,
        NatureService,
        WanderService,
        SceneService,
        HomeService,
        NotaddGrpcClientFactory
    ],
    exports: []
})
export class ResourceModule implements OnModuleInit {
    constructor(
        @Inject(MindfulnessService) private readonly mindfulnessService: MindfulnessService,
        @Inject(NatureService) private readonly natureService: NatureService,
        @Inject(WanderService) private readonly wanderService: WanderService,
        @Inject(SceneService) private readonly sceneService: SceneService,
        // @InjectRepository(User) private readonly userRepo: Repository<User>
    ) {
    }

    static forRoot(options: { i18n: 'en-US' | 'zh-CN' }): DynamicModule {
        i18nConfigure({
            locales: ['en-US', 'zh-CN'],
            defaultLocale: options.i18n,
            directory: 'src/i18n'
        });
        return {
            module: ResourceModule
        };
    }

    async onModuleInit() {
        // // await this.createSuperAdmin();
        //
        // const producer = new Producer({
        //     httpclient,
        //     accessKeyId: 'LTAIhIOInA2pDmga',
        //     accessKeySecret: '9FNpKB1WZpEwxWJbiWSMiCfuy3E3TL',
        //     producerGroup: 'PID_jiangzhuo_home',
        // });
        //
        // const msg = new Message('sati_debug', // topic
        //     'TagA', // tag
        //     'aaaaaaa' // body
        // );
        //
        // // set Message#keys
        // msg.keys = ['key1'];
        //
        // const sendResult = await producer.send(msg);
        // console.log(sendResult);
        //
        //
    }

    // /**
    //  * Create a system super administrator
    //  */
    // private async createSuperAdmin() {
    //     const sadmin = await this.userRepo.findOne({ where: { username: 'sadmin' } });
    //     if (sadmin) return;
    //     await this.userService.createUser({ username: 'sadmin', password: 'sadmin' });
    // }
}
