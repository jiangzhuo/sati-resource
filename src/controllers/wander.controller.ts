import { Inject, Injectable } from '@nestjs/common';
// import { GrpcMethod, RpcException } from '@nestjs/microservices';
// import { __ as t } from 'i18n';

import { WanderService } from '../services/wander.service';
import { Service, ServiceBroker, Context } from "moleculer";
import { InjectBroker } from 'nestjs-moleculer';
// import { LoggingInterceptor } from "../interceptors/logging.interceptor";
// import { ErrorsInterceptor } from "../interceptors/exception.interceptor";

@Injectable()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class WanderController extends Service {
    constructor(
        @InjectBroker() broker: ServiceBroker,
        @Inject(WanderService) private readonly wanderService: WanderService
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "wander",
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
                getWander:this.getWander,
                getWanderById:this.getWanderById,
                getWanderByIds:this.getWanderByIds,
                createWander:this.createWander,
                updateWander:this.updateWander,
                deleteWander:this.deleteWander,
                revertDeletedWander:this.revertDeletedWander,
                favoriteWander:this.favoriteWander,
                startWander:this.startWander,
                buyWander:this.buyWander,
                searchWander:this.searchWander,
                finishWander:this.finishWander,
                getWanderRecordByWanderId:this.getWanderRecordByWanderId,
                getWanderRecordByWanderIds:this.getWanderRecordByWanderIds,
                searchWanderRecord:this.searchWanderRecord,
                getWanderByWanderAlbumId:this.getWanderByWanderAlbumId,
                getWanderAlbum:this.getWanderAlbum,
                getWanderAlbumById:this.getWanderAlbumById,
                getWanderAlbumByIds:this.getWanderAlbumByIds,
                createWanderAlbum:this.createWanderAlbum,
                updateWanderAlbum:this.updateWanderAlbum,
                deleteWanderAlbum:this.deleteWanderAlbum,
                revertDeletedWanderAlbum:this.revertDeletedWanderAlbum,
                favoriteWanderAlbum:this.favoriteWanderAlbum,
                startWanderAlbum:this.startWanderAlbum,
                buyWanderAlbum:this.buyWanderAlbum,
                searchWanderAlbum:this.searchWanderAlbum,
                finishWanderAlbum:this.finishWanderAlbum,
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
        this.logger.info("wander service created.");
    }

    serviceStarted() {
        this.logger.info("wander service started.");
    }

    serviceStopped() {
        this.logger.info("wander service stopped.");
    }

    async sayHello(ctx: Context) {
        return this.wanderService.sayHello(ctx.params.name);
    }

    async getWander(ctx: Context) {
        return { data: await this.wanderService.getWander(ctx.params.first, ctx.params.after, ctx.params.before) };
    }

    async getWanderById(ctx: Context) {
        return { data: await this.wanderService.getWanderById(ctx.params.id) };
    }

    async getWanderByIds(ctx: Context) {
        return { data: await this.wanderService.getWanderByIds(ctx.params.ids) };
    }

    async createWander(ctx: Context) {
        return { data: await this.wanderService.createWander(ctx.params) };
    }

    async updateWander(ctx: Context) {
        return { data: await this.wanderService.updateWander(ctx.params.id, ctx.params) };
    }

    async deleteWander(ctx: Context) {
        return { data: await this.wanderService.deleteWander(ctx.params.id) };
    }

    async revertDeletedWander(ctx: Context) {
        return { data: await this.wanderService.revertDeletedWander(ctx.params.id) };
    }

    async favoriteWander(ctx: Context) {
        return { data: await this.wanderService.favoriteWander(ctx.params.userId, ctx.params.wanderId) };
    }

    async startWander(ctx: Context) {
        return { data: await this.wanderService.startWander(ctx.params.userId, ctx.params.wanderId) };
    }

    async buyWander(ctx: Context) {
        return { data: await this.wanderService.buyWander(ctx.params.userId, ctx.params.wanderId) };
    }

    async searchWander(ctx: Context) {
        return await this.wanderService.searchWander(ctx.params.keyword, ctx.params.from, ctx.params.size);
    }

    async finishWander(ctx: Context) {
        return { data: await this.wanderService.finishWander(ctx.params.userId, ctx.params.wanderId, ctx.params.duration) };
    }

    async getWanderRecordByWanderId(ctx: Context) {
        return { data: await this.wanderService.getWanderRecord(ctx.params.userId, ctx.params.wanderId) };
    }

    async getWanderRecordByWanderIds(ctx: Context) {
        return { data: await this.wanderService.getWanderRecord(ctx.params.userId, ctx.params.wanderIds) };
    }

    async searchWanderRecord(ctx: Context) {
        return { data: await this.wanderService.searchWanderRecord(ctx.params.userId, ctx.params.page, ctx.params.limit, ctx.params.sort, ctx.params.favorite, ctx.params.boughtTime) };
    }

    async getWanderByWanderAlbumId(ctx: Context) {
        return { data: await this.wanderService.getWanderByWanderAlbumId(ctx.params.id) };
    }

    async getWanderAlbum(ctx: Context) {
        return { data: await this.wanderService.getWanderAlbum(ctx.params.first, ctx.params.after, ctx.params.before) };
    }

    async getWanderAlbumById(ctx: Context) {
        return { data: await this.wanderService.getWanderAlbumById(ctx.params.id) };
    }

    async getWanderAlbumByIds(ctx: Context) {
        return { data: await this.wanderService.getWanderAlbumByIds(ctx.params.ids) };
    }

    async createWanderAlbum(ctx: Context) {
        return { data: await this.wanderService.createWanderAlbum(ctx.params) };
    }

    async updateWanderAlbum(ctx: Context) {
        return { data: await this.wanderService.updateWanderAlbum(ctx.params.id, ctx.params) };
    }

    async deleteWanderAlbum(ctx: Context) {
        return { data: await this.wanderService.deleteWanderAlbum(ctx.params.id) };
    }

    async revertDeletedWanderAlbum(ctx: Context) {
        return { data: await this.wanderService.revertDeletedWanderAlbum(ctx.params.id) };
    }

    async favoriteWanderAlbum(ctx: Context) {
        return { data: await this.wanderService.favoriteWanderAlbum(ctx.params.userId, ctx.params.wanderAlbumId) };
    }

    async startWanderAlbum(ctx: Context) {
        return { data: await this.wanderService.startWanderAlbum(ctx.params.userId, ctx.params.wanderAlbumId) };
    }

    async buyWanderAlbum(ctx: Context) {
        return { data: await this.wanderService.buyWanderAlbum(ctx.params.userId, ctx.params.wanderAlbumId) };
    }

    async searchWanderAlbum(ctx: Context) {
        return await this.wanderService.searchWanderAlbum(ctx.params.keyword, ctx.params.from, ctx.params.size);
    }

    async finishWanderAlbum(ctx: Context) {
        return { data: await this.wanderService.finishWanderAlbum(ctx.params.userId, ctx.params.wanderAlbumId, ctx.params.duration) };
    }

    async getWanderAlbumRecordByWanderAlbumId(ctx: Context) {
        return { data: await this.wanderService.getWanderAlbumRecord(ctx.params.userId, ctx.params.wanderAlbumId) };
    }

    async getWanderAlbumRecordByWanderAlbumIds(ctx: Context) {
        return { data: await this.wanderService.getWanderAlbumRecord(ctx.params.userId, ctx.params.wanderAlbumIds) };
    }

    async searchWanderAlbumRecord(ctx: Context) {
        return { data: await this.wanderService.searchWanderAlbumRecord(ctx.params.userId, ctx.params.page, ctx.params.limit, ctx.params.sort, ctx.params.favorite, ctx.params.boughtTime) };
    }
}
