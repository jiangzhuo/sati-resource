import * as util from "util";
import { DynamicModule, Inject, Module, OnModuleInit, Logger } from '@nestjs/common';
// import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
// import { configure as i18nConfigure } from 'i18n';

// import { NotaddGrpcClientFactory } from './grpc/grpc.client-factory';

// import { MindfulnessGrpcController } from './controllers/mindfulness.grpc.controller';
import { MindfulnessSchema } from './schemas/mindfulness.schema';
import { MindfulnessService } from './services/mindfulness.service';

// import { NatureGrpcController } from './controllers/nature.grpc.controller';
import { NatureSchema } from './schemas/nature.schema';
import { NatureService } from './services/nature.service';

// import { WanderGrpcController } from './controllers/wander.grpc.controller';
import { WanderSchema } from './schemas/wander.schema';
import { WanderService } from './services/wander.service';

import { WanderAlbumSchema } from './schemas/wanderAlbum.schema';

// import { SceneGrpcController } from './controllers/scene.grpc.controller';
import { SceneSchema } from './schemas/scene.schema';
import { SceneService } from './services/scene.service';

import { MindfulnessRecordSchema } from './schemas/mindfulnessRecord.schema';
import { NatureRecordSchema } from './schemas/natureRecord.schema';
import { WanderRecordSchema } from './schemas/wanderRecord.schema';
import { WanderAlbumRecordSchema } from './schemas/wanderAlbumRecord.schema';

import { UserSchema } from './schemas/user.schema';
import { MindfulnessTransactionSchema } from "./schemas/mindfulnessTransaction.schema";

import { HomeGrpcController } from "./controllers/home.grpc.controller";
import { HomeSchema } from "./schemas/home.schema";
import { HomeService } from "./services/home.service";

import { ElasticsearchModule } from '@nestjs/elasticsearch';
// import { MessageQueueModule } from "./modules/messageQueue.module";
import { OnsModule } from 'nestjs-ali-ons';
// import { MyLogger } from "./logger";
import { MoleculerModule } from 'nestjs-moleculer';
import { HomeController } from "./controllers/home.controller";
import { MindfulnessController } from "./controllers/mindfulness.controller";
import { NatureController } from "./controllers/nature.controller";
import { WanderController } from "./controllers/wander.controller";
import { SceneController } from "./controllers/scene.controller";

const httpclient = require('urllib');
// const Producer = require('ali-ons').Producer;
// const Message = require('ali-ons').Message;
// const logger = {
//     info() {
//     },
//     warn() {
//     },
//     error(...args) {
//         console.error(...args);
//     },
//     debug() {
//     },
// };

const onsLogger = new Logger('ons', true);

@Module({
    imports: [
        MoleculerModule.forRoot({
            namespace: "sati",
            // logger: bindings => new Logger(),
            transporter: "TCP",
            hotReload: true,
        }),
        // MoleculerModule.forFeature([{
        //     name: 'customServiceName',
        //     schema: HomeController,
        //     // schemaMods: { name: "newGreeter", version: "v3" }
        // }]),
        OnsModule.register({
            httpclient,
            accessKeyId: 'LTAIhIOInA2pDmga',
            accessKeySecret: '9FNpKB1WZpEwxWJbiWSMiCfuy3E3TL',
            producerGroup: 'PID_jiangzhuo_home',
            logger: {
                info(...args) {
                    // onsLogger.log( util.format.apply(util, args));
                },
                warn(...args) {
                    onsLogger.warn( util.format.apply(util, args));
                },
                error(...args) {
                    onsLogger.error( util.format.apply(util, args));
                },
                debug(...args) {
                    // onsLogger.log( util.format.apply(util, args));
                },
            },
            // logger: Object.assign(onsLogger, { info: onsLogger.log })
        }, [{ topic: 'sati_debug', tags: 'mindfulness', type: 'producer' },
            { topic: 'sati_debug', tags: 'nature', type: 'producer' },
            { topic: 'sati_debug', tags: 'wander', type: 'producer' },
            { topic: 'sati_debug', tags: 'wander_album', type: 'producer' }]),
        ElasticsearchModule.register({
            host: 'http://es-cn-mp90uekur0001c8sa.public.elasticsearch.aliyuncs.com:9200',
            httpAuth: 'elastic:Its%queOress2',
            log: 'trace',
        }),
        MongooseModule.forRoot('mongodb://sati:kjhguiyIUYkjh32kh@dds-2zee21d7f4fff2f41890-pub.mongodb.rds.aliyuncs.com:3717,dds-2zee21d7f4fff2f42351-pub.mongodb.rds.aliyuncs.com:3717/sati?replicaSet=mgset-9200157',
            // MongooseModule.forRoot('mongodb://localhost:27017/module_resource',
            { connectionName: 'sati', useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true }),
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
            { name: 'Home', schema: HomeSchema, collection: 'home' },
            { name: 'User', schema: UserSchema, collection: 'user' }
        ], 'sati'),
        // MongooseModule.forRoot('mongodb://sati:kjhguiyIUYkjh32kh@dds-2zee21d7f4fff2f41890-pub.mongodb.rds.aliyuncs.com:3717,dds-2zee21d7f4fff2f42351-pub.mongodb.rds.aliyuncs.com:3717/sati_user?replicaSet=mgset-9200157',
        //     // MongooseModule.forRoot('mongodb://localhost:27017/module_resource',
        //     { connectionName: 'user', useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true }),
        // MongooseModule.forFeature([{ name: 'User', schema: UserSchema, collection: 'user' }], 'user')
    ],
    controllers: [
        // MindfulnessGrpcController,
        // NatureGrpcController,
        // WanderGrpcController,
        // SceneGrpcController,
        // HomeGrpcController,
        MindfulnessController,
        NatureController,
        WanderController,
        SceneController,
        HomeController
    ],
    providers: [
        MindfulnessService,
        NatureService,
        WanderService,
        SceneService,
        HomeService
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

    static forRoot(): DynamicModule {
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
