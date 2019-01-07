import { Inject, Injectable } from '@nestjs/common';

import { MindfulnessService } from '../services/mindfulness.service';
import { Service, ServiceBroker, Context } from "moleculer";
import { InjectBroker } from 'nestjs-moleculer';

@Injectable()
export class MindfulnessController extends Service {
    constructor(
        @InjectBroker() broker: ServiceBroker,
        @Inject(MindfulnessService) private readonly mindfulnessService: MindfulnessService
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "mindfulness",
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
                getMindfulness: this.getMindfulness,
                getMindfulnessById: this.getMindfulnessById,
                getMindfulnessByIds: this.getMindfulnessByIds,
                createMindfulness: this.createMindfulness,
                updateMindfulness: this.updateMindfulness,
                deleteMindfulness: this.deleteMindfulness,
                revertDeletedMindfulness: this.revertDeletedMindfulness,
                favoriteMindfulness: this.favoriteMindfulness,
                startMindfulness: this.startMindfulness,
                finishMindfulness: this.finishMindfulness,
                buyMindfulness: this.buyMindfulness,
                searchMindfulness: this.searchMindfulness,
                getMindfulnessRecordByMindfulnessId: this.getMindfulnessRecordByMindfulnessId,
                getMindfulnessRecordByMindfulnessIds: this.getMindfulnessRecordByMindfulnessIds,
                searchMindfulnessRecord: this.searchMindfulnessRecord,

                getMindfulnessByMindfulnessAlbumId:this.getMindfulnessByMindfulnessAlbumId,
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
        this.logger.info("mindfulness service created.");
    }

    serviceStarted() {
        this.logger.info("mindfulness service started.");
    }

    serviceStopped() {
        this.logger.info("mindfulness service stopped.");
    }

    async sayHello(ctx: Context) {
        return this.mindfulnessService.sayHello(ctx.params.name);
    }

    async getMindfulness(ctx: Context) {
        const data = await this.mindfulnessService.getMindfulness(ctx.params.first, ctx.params.after, ctx.params.before, ctx.params.status)
        return { data };
    }

    async getMindfulnessById(ctx: Context) {
        return { data: await this.mindfulnessService.getMindfulnessById(ctx.params.id) };
    }

    async getMindfulnessByIds(ctx: Context) {
        return { data: await this.mindfulnessService.getMindfulnessByIds(ctx.params.ids) };
    }

    async createMindfulness(ctx: Context) {
        return { data: await this.mindfulnessService.createMindfulness(ctx.params) };
    }

    async updateMindfulness(ctx: Context) {
        return { data: await this.mindfulnessService.updateMindfulness(ctx.params.id, ctx.params) };
    }

    async deleteMindfulness(ctx: Context) {
        return { data: await this.mindfulnessService.deleteMindfulness(ctx.params.id) };
    }

    async revertDeletedMindfulness(ctx: Context) {
        return { data: await this.mindfulnessService.revertDeletedMindfulness(ctx.params.id) };
    }

    async favoriteMindfulness(ctx: Context) {
        return { data: await this.mindfulnessService.favoriteMindfulness(ctx.params.userId, ctx.params.mindfulnessId) };
    }

    async startMindfulness(ctx: Context) {
        return { data: await this.mindfulnessService.startMindfulness(ctx.params.userId, ctx.params.mindfulnessId) };
    }

    async finishMindfulness(ctx: Context) {
        return { data: await this.mindfulnessService.finishMindfulness(ctx.params.userId, ctx.params.mindfulnessId, ctx.params.duration) };
    }

    async getMindfulnessRecordByMindfulnessId(ctx: Context) {
        return { data: await this.mindfulnessService.getMindfulnessRecord(ctx.params.userId, ctx.params.mindfulnessId) };
    }

    async getMindfulnessRecordByMindfulnessIds(ctx: Context) {
        return { data: await this.mindfulnessService.getMindfulnessRecord(ctx.params.userId, ctx.params.mindfulnessIds) };
    }

    async searchMindfulnessRecord(ctx: Context) {
        return { data: await this.mindfulnessService.searchMindfulnessRecord(ctx.params.userId, ctx.params.page, ctx.params.limit, ctx.params.sort, ctx.params.favorite, ctx.params.boughtTime) };
    }

    async buyMindfulness(ctx: Context) {
        const discount = await ctx.call('discount.getDiscountByResourceId', { resourceId: ctx.params.mindfulnessId });
        return { data: await this.mindfulnessService.buyMindfulness(ctx.params.userId, ctx.params.mindfulnessId, discount) };
    }

    async searchMindfulness(ctx: Context) {
        return await this.mindfulnessService.searchMindfulness(ctx.params.keyword, (ctx.params.page - 1) * ctx.params.limit, ctx.params.limit);
    }

    async getMindfulnessByMindfulnessAlbumId(ctx: Context) {
        return { data: await this.mindfulnessService.getMindfulnessByMindfulnessAlbumId(ctx.params.id) };
    }
}
