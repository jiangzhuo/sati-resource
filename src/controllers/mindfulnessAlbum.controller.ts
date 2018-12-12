import { Inject, Injectable } from '@nestjs/common';
// import { GrpcMethod, RpcException } from '@nestjs/microservices';
// import { __ as t } from 'i18n';

import { MindfulnessAlbumService } from '../services/mindfulnessAlbum.service';
import { Service, ServiceBroker, Context } from "moleculer";
import { InjectBroker } from 'nestjs-moleculer';
// import { LoggingInterceptor } from "../interceptors/logging.interceptor";
// import { ErrorsInterceptor } from "../interceptors/exception.interceptor";

@Injectable()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class MindfulnessAlbumController extends Service {
    constructor(
        @InjectBroker() broker: ServiceBroker,
        @Inject(MindfulnessAlbumService) private readonly mindfulnessAlbumService: MindfulnessAlbumService
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "mindfulnessAlbum",
            //version: "v2",
            // dependencies: [
            // 	"auth",
            // 	"users"
            // ],
            settings: {
                upperCase: true
            },
            actions: {
                sayHello:this.sayHello,

                getMindfulnessAlbum:this.getMindfulnessAlbum,
                getMindfulnessAlbumById:this.getMindfulnessAlbumById,
                getMindfulnessAlbumByIds:this.getMindfulnessAlbumByIds,
                createMindfulnessAlbum:this.createMindfulnessAlbum,
                updateMindfulnessAlbum:this.updateMindfulnessAlbum,
                deleteMindfulnessAlbum:this.deleteMindfulnessAlbum,
                revertDeletedMindfulnessAlbum:this.revertDeletedMindfulnessAlbum,
                favoriteMindfulnessAlbum:this.favoriteMindfulnessAlbum,
                startMindfulnessAlbum:this.startMindfulnessAlbum,
                finishMindfulnessAlbum:this.finishMindfulnessAlbum,
                buyMindfulnessAlbum:this.buyMindfulnessAlbum,
                searchMindfulnessAlbum:this.searchMindfulnessAlbum,
                getMindfulnessAlbumRecordByMindfulnessAlbumId:this.getMindfulnessAlbumRecordByMindfulnessAlbumId,
                getMindfulnessAlbumRecordByMindfulnessAlbumIds:this.getMindfulnessAlbumRecordByMindfulnessAlbumIds,
                searchMindfulnessAlbumRecord:this.searchMindfulnessAlbumRecord,
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
        this.logger.info("mindfulnessAlbum service created.");
    }

    serviceStarted() {
        this.logger.info("mindfulnessAlbum service started.");
    }

    serviceStopped() {
        this.logger.info("mindfulnessAlbum service stopped.");
    }

    async sayHello(ctx: Context) {
        return this.mindfulnessAlbumService.sayHello(ctx.params.name);
    }

    async getMindfulnessAlbum(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.getMindfulnessAlbum(ctx.params.first, ctx.params.after, ctx.params.before, ctx.params.status) };
    }

    async getMindfulnessAlbumById(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.getMindfulnessAlbumById(ctx.params.id) };
    }

    async getMindfulnessAlbumByIds(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.getMindfulnessAlbumByIds(ctx.params.ids) };
    }

    async createMindfulnessAlbum(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.createMindfulnessAlbum(ctx.params) };
    }

    async updateMindfulnessAlbum(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.updateMindfulnessAlbum(ctx.params.id, ctx.params) };
    }

    async deleteMindfulnessAlbum(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.deleteMindfulnessAlbum(ctx.params.id) };
    }

    async revertDeletedMindfulnessAlbum(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.revertDeletedMindfulnessAlbum(ctx.params.id) };
    }

    async favoriteMindfulnessAlbum(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.favoriteMindfulnessAlbum(ctx.params.userId, ctx.params.mindfulnessAlbumId) };
    }

    async startMindfulnessAlbum(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.startMindfulnessAlbum(ctx.params.userId, ctx.params.mindfulnessAlbumId) };
    }

    async buyMindfulnessAlbum(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.buyMindfulnessAlbum(ctx.params.userId, ctx.params.mindfulnessAlbumId) };
    }

    async searchMindfulnessAlbum(ctx: Context) {
        return await this.mindfulnessAlbumService.searchMindfulnessAlbum(ctx.params.keyword, (ctx.params.page - 1) * ctx.params.limit, ctx.params.limit);
    }

    async finishMindfulnessAlbum(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.finishMindfulnessAlbum(ctx.params.userId, ctx.params.mindfulnessAlbumId, ctx.params.duration) };
    }

    async getMindfulnessAlbumRecordByMindfulnessAlbumId(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.getMindfulnessAlbumRecord(ctx.params.userId, ctx.params.mindfulnessAlbumId) };
    }

    async getMindfulnessAlbumRecordByMindfulnessAlbumIds(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.getMindfulnessAlbumRecord(ctx.params.userId, ctx.params.mindfulnessAlbumIds) };
    }

    async searchMindfulnessAlbumRecord(ctx: Context) {
        return { data: await this.mindfulnessAlbumService.searchMindfulnessAlbumRecord(ctx.params.userId, ctx.params.page, ctx.params.limit, ctx.params.sort, ctx.params.favorite, ctx.params.boughtTime) };
    }
}
