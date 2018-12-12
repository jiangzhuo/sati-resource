import { Inject, Injectable } from '@nestjs/common';
// import { GrpcMethod, RpcException } from '@nestjs/microservices';
// import { __ as t } from 'i18n';

import { SceneService } from '../services/scene.service';
import { Service, ServiceBroker, Context } from "moleculer";
import { InjectBroker } from 'nestjs-moleculer';
// import { LoggingInterceptor } from "../interceptors/logging.interceptor";
// import { ErrorsInterceptor } from "../interceptors/exception.interceptor";

@Injectable()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class SceneController extends Service {
    constructor(
        @InjectBroker() broker: ServiceBroker,
        @Inject(SceneService) private readonly sceneService: SceneService
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "scene",
            //version: "v2",
            // dependencies: [
            // 	"auth",
            // 	"users"
            // ],
            settings: {
                upperCase: true
            },
            actions: {
                sayHello: this.sayHello,
                createScene: this.createScene,
                updateScene: this.updateScene,
                deleteScene: this.deleteScene,
                getScene: this.getScene,
                getSceneById: this.getSceneById,
                getSceneByIds: this.getSceneByIds,
                // welcome: {
                //     cache: {
                //         keys: ["name"]
                //     },
                //     params: {
                //         name: "string"
                //     },
                //     handler: this.welcome
                // }
            },
            // events: {
            //     "user.created": this.userCreated
            // },
            created: this.serviceCreated,
            started: this.serviceStarted,
            stopped: this.serviceStopped,
        });
    }

    serviceCreated() {
        this.logger.info("nature service created.");
    }

    serviceStarted() {
        this.logger.info("nature service started.");
    }

    serviceStopped() {
        this.logger.info("nature service stopped.");
    }

    async sayHello(ctx: Context) {
        return this.sceneService.sayHello(ctx.params.name);
    }

    async createScene(ctx: Context) {
        return { data: await this.sceneService.createScene(ctx.params.name) };
    }

    async updateScene(ctx: Context) {
        return { data: await this.sceneService.updateScene(ctx.params.id, ctx.params.name) };
    }

    async deleteScene(ctx: Context) {
        return { data: await this.sceneService.deleteScene(ctx.params.id) };
    }

    async getScene(ctx: Context) {
        return { data: await this.sceneService.getScene(ctx.params.first, ctx.params.after) };
    }

    async getSceneById(ctx: Context) {
        return { data: await this.sceneService.getSceneById(ctx.params.id) };
    }

    async getSceneByIds(ctx: Context) {
        return { data: await this.sceneService.getSceneByIds(ctx.params.ids) };
    }
}
