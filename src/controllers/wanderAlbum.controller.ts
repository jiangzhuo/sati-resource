import { Inject, Injectable } from '@nestjs/common';
// import { GrpcMethod, RpcException } from '@nestjs/microservices';
// import { __ as t } from 'i18n';

import { WanderAlbumService } from '../services/wanderAlbum.service';
import { Service, ServiceBroker, Context } from "moleculer";
import { InjectBroker } from 'nestjs-moleculer';
// import { LoggingInterceptor } from "../interceptors/logging.interceptor";
// import { ErrorsInterceptor } from "../interceptors/exception.interceptor";

@Injectable()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class WanderAlbumController extends Service {
    constructor(
        @InjectBroker() broker: ServiceBroker,
        @Inject(WanderAlbumService) private readonly wanderAlbumService: WanderAlbumService
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "wanderAlbum",
            //version: "v2",
            meta: {
                scalable: true
            },
            // dependencies: [
            // 	"auth",
            // 	"users"
            // ],
            settings: {
                upperCase: true
            },
            actions: {
                sayHello:this.sayHello,

                getWanderAlbum:this.getWanderAlbum,
                getWanderAlbumById:this.getWanderAlbumById,
                getWanderAlbumByIds:this.getWanderAlbumByIds,
                createWanderAlbum:this.createWanderAlbum,
                updateWanderAlbum:this.updateWanderAlbum,
                deleteWanderAlbum:this.deleteWanderAlbum,
                revertDeletedWanderAlbum:this.revertDeletedWanderAlbum,
                favoriteWanderAlbum:this.favoriteWanderAlbum,
                startWanderAlbum:this.startWanderAlbum,
                finishWanderAlbum:this.finishWanderAlbum,
                buyWanderAlbum:this.buyWanderAlbum,
                searchWanderAlbum:this.searchWanderAlbum,
                getWanderAlbumRecordByWanderAlbumId:this.getWanderAlbumRecordByWanderAlbumId,
                getWanderAlbumRecordByWanderAlbumIds:this.getWanderAlbumRecordByWanderAlbumIds,
                searchWanderAlbumRecord:this.searchWanderAlbumRecord,
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
        this.logger.info("wanderAlbum service created.");
    }

    serviceStarted() {
        this.logger.info("wanderAlbum service started.");
    }

    serviceStopped() {
        this.logger.info("wanderAlbum service stopped.");
    }

    async sayHello(ctx: Context) {
        return this.wanderAlbumService.sayHello(ctx.params.name);
    }

    async getWanderAlbum(ctx: Context) {
        return { data: await this.wanderAlbumService.getWanderAlbum(ctx.params.first, ctx.params.after, ctx.params.before, ctx.params.status) };
    }

    async getWanderAlbumById(ctx: Context) {
        return { data: await this.wanderAlbumService.getWanderAlbumById(ctx.params.id) };
    }

    async getWanderAlbumByIds(ctx: Context) {
        return { data: await this.wanderAlbumService.getWanderAlbumByIds(ctx.params.ids) };
    }

    async createWanderAlbum(ctx: Context) {
        return { data: await this.wanderAlbumService.createWanderAlbum(ctx.params) };
    }

    async updateWanderAlbum(ctx: Context) {
        return { data: await this.wanderAlbumService.updateWanderAlbum(ctx.params.id, ctx.params) };
    }

    async deleteWanderAlbum(ctx: Context) {
        return { data: await this.wanderAlbumService.deleteWanderAlbum(ctx.params.id) };
    }

    async revertDeletedWanderAlbum(ctx: Context) {
        return { data: await this.wanderAlbumService.revertDeletedWanderAlbum(ctx.params.id) };
    }

    async favoriteWanderAlbum(ctx: Context) {
        return { data: await this.wanderAlbumService.favoriteWanderAlbum(ctx.params.userId, ctx.params.wanderAlbumId) };
    }

    async startWanderAlbum(ctx: Context) {
        return { data: await this.wanderAlbumService.startWanderAlbum(ctx.params.userId, ctx.params.wanderAlbumId) };
    }

    async buyWanderAlbum(ctx: Context) {
        return { data: await this.wanderAlbumService.buyWanderAlbum(ctx.params.userId, ctx.params.wanderAlbumId) };
    }

    async searchWanderAlbum(ctx: Context) {
        return await this.wanderAlbumService.searchWanderAlbum(ctx.params.keyword, (ctx.params.page - 1) * ctx.params.limit, ctx.params.limit);
    }

    async finishWanderAlbum(ctx: Context) {
        return { data: await this.wanderAlbumService.finishWanderAlbum(ctx.params.userId, ctx.params.wanderAlbumId, ctx.params.duration) };
    }

    async getWanderAlbumRecordByWanderAlbumId(ctx: Context) {
        return { data: await this.wanderAlbumService.getWanderAlbumRecord(ctx.params.userId, ctx.params.wanderAlbumId) };
    }

    async getWanderAlbumRecordByWanderAlbumIds(ctx: Context) {
        return { data: await this.wanderAlbumService.getWanderAlbumRecord(ctx.params.userId, ctx.params.wanderAlbumIds) };
    }

    async searchWanderAlbumRecord(ctx: Context) {
        return { data: await this.wanderAlbumService.searchWanderAlbumRecord(ctx.params.userId, ctx.params.page, ctx.params.limit, ctx.params.sort, ctx.params.favorite, ctx.params.boughtTime) };
    }
}
