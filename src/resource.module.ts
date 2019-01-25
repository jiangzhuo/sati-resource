import * as util from "util";
import { DynamicModule, Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MindfulnessSchema } from './schemas/mindfulness.schema';
import { MindfulnessService } from './services/mindfulness.service';
import { NatureSchema } from './schemas/nature.schema';
import { NatureService } from './services/nature.service';
import { WanderSchema } from './schemas/wander.schema';
import { WanderService } from './services/wander.service';

import { WanderAlbumSchema } from './schemas/wanderAlbum.schema';
import { SceneSchema } from './schemas/scene.schema';
import { SceneService } from './services/scene.service';

import { MindfulnessRecordSchema } from './schemas/mindfulnessRecord.schema';
import { NatureRecordSchema } from './schemas/natureRecord.schema';
import { WanderRecordSchema } from './schemas/wanderRecord.schema';
import { WanderAlbumRecordSchema } from './schemas/wanderAlbumRecord.schema';

import { UserSchema } from './schemas/user.schema';
import { HomeSchema } from "./schemas/home.schema";
import { HomeService } from "./services/home.service";

import { MoleculerModule } from 'nestjs-moleculer';
import { HomeController } from "./controllers/home.controller";
import { MindfulnessController } from "./controllers/mindfulness.controller";
import { NatureController } from "./controllers/nature.controller";
import { WanderController } from "./controllers/wander.controller";
import { WanderAlbumController } from "./controllers/wanderAlbum.controller";
import { SceneController } from "./controllers/scene.controller";
import { NatureAlbumService } from "./services/natureAlbum.service";
import { MindfulnessAlbumService } from "./services/mindfulnessAlbum.service";
import { WanderAlbumService } from "./services/wanderAlbum.service";
import { MindfulnessAlbumSchema } from "./schemas/mindfulnessAlbum.schema";
import { NatureAlbumSchema } from "./schemas/natureAlbum.schema";
import { MindfulnessAlbumRecordSchema } from "./schemas/mindfulnessAlbumRecord.schema";
import { NatureAlbumRecordSchema } from "./schemas/natureAlbumRecord.schema";
import { NatureAlbumController } from "./controllers/natureAlbum.controller";
import { MindfulnessAlbumController } from "./controllers/mindfulnessAlbum.controller";
import { DiscountService } from "./services/discount.service";
import { Discount } from "./interfaces/discount.interface";
import { DiscountController } from "./controllers/discount.controller";
import { DiscountSchema } from "./schemas/discount.schema";
import { AccountSchema } from "./schemas/account.schema";
import { JaegerController } from "./controllers/jaeger.controller";
import * as jaeger from 'moleculer-jaeger';

// const httpclient = require('urllib');

@Module({
    imports: [
        MoleculerModule.forRoot({
            namespace: "sati",
            // logger: bindings => new Logger(),
            metrics: true,
            transporter: process.env.TRANSPORTER,
            hotReload: true,
            logLevel: process.env.LOG_LEVEL
        }),
        MoleculerModule.forFeature([{
            name: 'jaeger',
            schema: jaeger,
        }]),
        MongooseModule.forRoot(process.env.MONGODB_CONNECTION_STR,
            // MongooseModule.forRoot('mongodb://localhost:27017/module_resource',
            { connectionName: 'sati', useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true }),
        MongooseModule.forFeature([
            { name: 'Mindfulness', schema: MindfulnessSchema, collection: 'mindfulness' },
            { name: 'MindfulnessAlbum', schema: MindfulnessAlbumSchema, collection: 'mindfulnessAlbum' },
            { name: 'Nature', schema: NatureSchema, collection: 'nature' },
            { name: 'NatureAlbum', schema: NatureAlbumSchema, collection: 'natureAlbum' },
            { name: 'Wander', schema: WanderSchema, collection: 'wander' },
            { name: 'WanderAlbum', schema: WanderAlbumSchema, collection: 'wanderAlbum' },
            { name: 'Scene', schema: SceneSchema, collection: 'scene' },
            { name: 'MindfulnessRecord', schema: MindfulnessRecordSchema, collection: 'mindfulnessRecord' },
            { name: 'MindfulnessAlbumRecord', schema: MindfulnessAlbumRecordSchema, collection: 'mindfulnessAlbumRecord' },
            { name: 'NatureRecord', schema: NatureRecordSchema, collection: 'natureRecord' },
            { name: 'NatureAlbumRecord', schema: NatureAlbumRecordSchema, collection: 'natureAlbumRecord' },
            { name: 'WanderRecord', schema: WanderRecordSchema, collection: 'wanderRecord' },
            { name: 'WanderAlbumRecord', schema: WanderAlbumRecordSchema, collection: 'wanderAlbumRecord' },
            { name: 'Home', schema: HomeSchema, collection: 'home' },
            { name: 'User', schema: UserSchema, collection: 'user' },
            { name: 'Account', schema: AccountSchema, collection: 'account' },
            { name: 'Discount', schema: DiscountSchema, collection: 'discount' }
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
        MindfulnessAlbumController,
        NatureController,
        NatureAlbumController,
        WanderController,
        WanderAlbumController,
        SceneController,
        HomeController,
        DiscountController,
        // JaegerController
    ],
    providers: [
        MindfulnessService,
        MindfulnessAlbumService,
        NatureService,
        NatureAlbumService,
        WanderService,
        WanderAlbumService,
        SceneService,
        HomeService,
        DiscountService
    ],
    exports: []
})
export class ResourceModule implements OnModuleInit {
    constructor(
        @Inject(MindfulnessService) private readonly mindfulnessService: MindfulnessService,
        @Inject(NatureService) private readonly natureService: NatureService,
        @Inject(WanderService) private readonly wanderService: WanderService,
        @Inject(SceneService) private readonly sceneService: SceneService,
        @Inject(DiscountService) private readonly discountService: DiscountService,
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
