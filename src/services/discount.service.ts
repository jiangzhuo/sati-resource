import { Model } from 'mongoose';
import { Discount } from "../interfaces/discount.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isArray, isEmpty, isNumber } from 'lodash';
import * as moment from "moment";

@Injectable()
export class DiscountService {
    constructor(
        @InjectModel('Discount') private readonly discountModel: Model<Discount>,
    ) {
    }

    async sayHello(name: string) {
        return { msg: `Discount Hello ${ name }!` };
    }

    async getDiscount(first = 20, after?: number, before?: number, discount?: number) {
        let query = {};
        if (isNumber(after)) {
            query['$gte'] = after;
            // query.push({ beginTime: { $gt: after, $lt: before } });
        }
        if (isNumber(before)) {
            query['$lte'] = before;
            // query.push({ endTime: { $gt: after, $lt: before } });
        }
        let sortArg;
        if (first > 0) {
            sortArg = { beginTime: 1 }
        } else {
            sortArg = { beginTime: -1 }
        }
        let conditions = {};
        if (isNumber(after) || isNumber(before)) {
            conditions = { $or: [{ beginTime: query }, { endTime: query }] }
        }
        if (isNumber(discount)) {
            conditions["discount"] = { $lte: discount }
        }
        return await this.discountModel.find(conditions).sort(sortArg).limit(Math.abs(first)).exec();
    }

    async getDiscountByFromAndSize(from?: number, size?: number) {
        let condition = {};
        return await this.discountModel.find(condition).sort({ beginTime: -1 }).skip(from).limit(size).exec()
    }

    async countDiscount() {
        let condition = {};
        return await this.discountModel.count(condition).exec()
    }

    async getDiscountByIds(ids) {
        return await this.discountModel.find({ _id: { $in: ids } }).exec()
    }

    async createDiscount(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        return await this.discountModel.create(data);
    }

    async updateDiscount(id, data) {
        let updateObject = { updateTime: moment().unix() };
        if (!isEmpty(data.type)) {
            updateObject['type'] = data.type;
        }
        if (!isEmpty(data.resourceId)) {
            updateObject['resourceId'] = data.resourceId;
        }
        if (isArray(data.background)) {
            updateObject['background'] = data.background;
        }
        if (!isEmpty(data.name)) {
            updateObject['name'] = data.name;
        }
        if (isNumber(data.discount)) {
            updateObject['discount'] = data.discount;
        }
        if (isNumber(data.beginTime)) {
            updateObject['beginTime'] = data.beginTime;
        }
        if (isNumber(data.endTime)) {
            updateObject['endTime'] = data.endTime;
        }
        return await this.discountModel.findOneAndUpdate({ _id: id }, updateObject).exec()
    }

    async deleteDiscount(id) {
        return await this.discountModel.findOneAndRemove({ _id: id }).exec();
    }
}
