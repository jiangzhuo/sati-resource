import { Service, Context, ServiceBroker } from 'moleculer';
import { Inject, Injectable } from '@nestjs/common';
import { DiscountService } from "../services/discount.service";
import { InjectBroker } from 'nestjs-moleculer';

@Injectable()
export class DiscountController extends Service {
    constructor(@InjectBroker() broker: ServiceBroker,
                @Inject(DiscountService) private readonly discountService: DiscountService
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "discount",
            settings: {
                upperCase: true
            },
            actions: {
                sayHello: this.sayHello,
                getDiscount: this.getDiscount,
                countDiscount: this.countDiscount,
                getDiscountById: this.getDiscountById,
                getDiscountByIds: this.getDiscountByIds,
                getDiscountByResourceId: this.getDiscountByResourceId,
                createDiscount: this.createDiscount,
                updateDiscount: this.updateDiscount,
                deleteDiscount: this.deleteDiscount,
            },
            created: this.serviceCreated,
            started: this.serviceStarted,
            stopped: this.serviceStopped,
        });
    }

    serviceCreated() {
        this.logger.info("discount service created.");
    }

    serviceStarted() {
        this.logger.info("discount service started.");
    }

    serviceStopped() {
        this.logger.info("discount service stopped.");
    }

    async sayHello(ctx: Context) {
        return this.discountService.sayHello(ctx.params.name);
    }

    async getDiscount(ctx: Context) {
        if (ctx.params.page) {
            return { data: await this.discountService.getDiscountByFromAndSize((ctx.params.page - 1) * ctx.params.limit, ctx.params.limit) }
        } else {
            return { data: await this.discountService.getDiscount(ctx.params.first, ctx.params.after, ctx.params.before, ctx.params.discount) };
        }
    }

    async countDiscount(){
        return { data: await this.discountService.countDiscount() }
    }

    async getDiscountById(ctx: Context) {
        return await this.discountService.getDiscountById(ctx.params.id);
    }

    async getDiscountByIds(ctx: Context) {
        return { data: await this.discountService.getDiscountByIds(ctx.params.ids) };
    }

    async getDiscountByResourceId(ctx: Context) {
        const discounts = await this.discountService.getDiscountByResourceId(ctx.params.resourceId, ctx.params.time);
        let discountValue = 100;
        let finalDiscount = null;
        discounts.forEach((discount) => {
            if (discount.discount <= discountValue) {
                finalDiscount = discount;
            }
        });
        return finalDiscount;
    }

    async createDiscount(ctx: Context) {
        return { data: await this.discountService.createDiscount(ctx.params) };
    }

    async updateDiscount(ctx: Context) {
        return { data: await this.discountService.updateDiscount(ctx.params.id, ctx.params) };
    }

    async deleteDiscount(ctx: Context) {
        return { data: await this.discountService.deleteDiscount(ctx.params.id) };
    }
}
