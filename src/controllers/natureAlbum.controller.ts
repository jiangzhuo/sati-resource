import { Inject, Injectable } from '@nestjs/common';
import { NatureAlbumService } from '../services/natureAlbum.service';
import { Context, Service, ServiceBroker } from "moleculer";
import { InjectBroker } from 'nestjs-moleculer';

@Injectable()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class NatureAlbumController extends Service {
    constructor(
        @InjectBroker() broker: ServiceBroker,
        @Inject(NatureAlbumService) private readonly natureAlbumService: NatureAlbumService
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "natureAlbum",
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

                getNatureAlbum:this.getNatureAlbum,
                getNatureAlbumById:this.getNatureAlbumById,
                getNatureAlbumByIds:this.getNatureAlbumByIds,
                createNatureAlbum:this.createNatureAlbum,
                updateNatureAlbum:this.updateNatureAlbum,
                deleteNatureAlbum:this.deleteNatureAlbum,
                revertDeletedNatureAlbum:this.revertDeletedNatureAlbum,
                favoriteNatureAlbum:this.favoriteNatureAlbum,
                startNatureAlbum:this.startNatureAlbum,
                finishNatureAlbum:this.finishNatureAlbum,
                buyNatureAlbum:this.buyNatureAlbum,
                searchNatureAlbum:this.searchNatureAlbum,
                getNatureAlbumRecordByNatureAlbumId:this.getNatureAlbumRecordByNatureAlbumId,
                getNatureAlbumRecordByNatureAlbumIds:this.getNatureAlbumRecordByNatureAlbumIds,
                searchNatureAlbumRecord:this.searchNatureAlbumRecord,
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
        this.logger.info("natureAlbum service created.");
    }

    serviceStarted() {
        this.logger.info("natureAlbum service started.");
    }

    serviceStopped() {
        this.logger.info("natureAlbum service stopped.");
    }

    async sayHello(ctx: Context) {
        return this.natureAlbumService.sayHello(ctx.params.name);
    }

    async getNatureAlbum(ctx: Context) {
        return { data: await this.natureAlbumService.getNatureAlbum(ctx.params.first, ctx.params.after, ctx.params.before, ctx.params.status) };
    }

    async getNatureAlbumById(ctx: Context) {
        return { data: await this.natureAlbumService.getNatureAlbumById(ctx.params.id) };
    }

    async getNatureAlbumByIds(ctx: Context) {
        return { data: await this.natureAlbumService.getNatureAlbumByIds(ctx.params.ids) };
    }

    async createNatureAlbum(ctx: Context) {
        return { data: await this.natureAlbumService.createNatureAlbum(ctx.params) };
    }

    async updateNatureAlbum(ctx: Context) {
        return { data: await this.natureAlbumService.updateNatureAlbum(ctx.params.id, ctx.params) };
    }

    async deleteNatureAlbum(ctx: Context) {
        return { data: await this.natureAlbumService.deleteNatureAlbum(ctx.params.id) };
    }

    async revertDeletedNatureAlbum(ctx: Context) {
        return { data: await this.natureAlbumService.revertDeletedNatureAlbum(ctx.params.id) };
    }

    async favoriteNatureAlbum(ctx: Context) {
        return { data: await this.natureAlbumService.favoriteNatureAlbum(ctx.params.userId, ctx.params.natureAlbumId) };
    }

    async startNatureAlbum(ctx: Context) {
        return { data: await this.natureAlbumService.startNatureAlbum(ctx.params.userId, ctx.params.natureAlbumId) };
    }

    async buyNatureAlbum(ctx: Context) {
        return { data: await this.natureAlbumService.buyNatureAlbum(ctx.params.userId, ctx.params.natureAlbumId) };
    }

    async searchNatureAlbum(ctx: Context) {
        return await this.natureAlbumService.searchNatureAlbum(ctx.params.keyword, ctx.params.from, ctx.params.size);
    }

    async finishNatureAlbum(ctx: Context) {
        return { data: await this.natureAlbumService.finishNatureAlbum(ctx.params.userId, ctx.params.natureAlbumId, ctx.params.duration) };
    }

    async getNatureAlbumRecordByNatureAlbumId(ctx: Context) {
        return { data: await this.natureAlbumService.getNatureAlbumRecord(ctx.params.userId, ctx.params.natureAlbumId) };
    }

    async getNatureAlbumRecordByNatureAlbumIds(ctx: Context) {
        return { data: await this.natureAlbumService.getNatureAlbumRecord(ctx.params.userId, ctx.params.natureAlbumIds) };
    }

    async searchNatureAlbumRecord(ctx: Context) {
        return { data: await this.natureAlbumService.searchNatureAlbumRecord(ctx.params.userId, ctx.params.page, ctx.params.limit, ctx.params.sort, ctx.params.favorite, ctx.params.boughtTime) };
    }
}
