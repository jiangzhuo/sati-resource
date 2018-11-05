import { Model } from 'mongoose';
import { Nature } from "../interfaces/nature.interface";
import { NatureRecord } from "../interfaces/natureRecord.interface";
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from "moment";
import { isEmpty, isNumber, isArray, isBoolean } from 'lodash';
import { RpcException } from "@nestjs/microservices";
import { __ as t } from "i18n";
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Producer } from 'ali-ons';
import { InjectProducer } from 'nestjs-ali-ons';

@Injectable()
export class NatureService {
    constructor(
        @InjectProducer('sati_debug', 'nature') private readonly producer: Producer,
        @Inject(ElasticsearchService) private readonly elasticsearchService: ElasticsearchService,
        @InjectModel('Nature') private readonly natureModel: Model<Nature>,
        @InjectModel('NatureRecord') private readonly natureRecordModel: Model<NatureRecord>
    ) { }

    async sayHello(name: string) {
        return { msg: `Nature Hello ${name}!` };
    }

    async getNature(first = 20, after?: string) {
        if (after) {
            return await this.natureModel.find(
                { _id: { $lt: after } },
                null,
                { sort: '-_id' }).limit(first).exec();
        } else {
            return await this.natureModel.find({}, null, { sort: '-_id' }).limit(first).exec();
        }
    }

    async getNatureById(id) {
        return await this.natureModel.findOne({ _id: id }).exec()
    }

    async getNatureByIds(ids) {
        return await this.natureModel.find({ _id: { $in: ids } }).exec()
    }

    async getNatureRecord(userId: string, natureId: string);
    async getNatureRecord(userId: string, natureId: string[]);
    async getNatureRecord(userId, natureId) {
        if (isArray(natureId)) {
            return await this.natureRecordModel.find({
                userId: userId,
                natureId: { $in: natureId }
            }).exec()
        } else if (typeof natureId === 'string') {
            return await this.natureRecordModel.findOne({ userId: userId, natureId: natureId }).exec()
        }
    }

    async searchNatureRecord(userId: string, page: number, limit: number, sort: string, favorite?: boolean, boughtTime?: number[]) {
        let conditions = {}
        if (isBoolean(favorite)) {
            // 偶数是没有收藏 奇数是收藏，所以true搜索奇数，false搜索偶数
            if (favorite) {
                conditions['favorite'] = { $mod: [2, 1] }
            } else {
                conditions['favorite'] = { $mod: [2, 0] }
            }
        }
        if (isArray(boughtTime) && boughtTime.length === 2) {
            // 第一个元素是开始时间 第二个元素是结束时间
            conditions['boughtTime'] = { $gte: boughtTime[0], $lte: boughtTime[1] }
        }
        return await this.natureRecordModel.find(
            conditions,
            null,
            { sort: sort, limit: limit, skip: (page - 1) * limit }).exec()
    }

    async createNature(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        return await this.natureModel.create(data)
    }

    async updateNature(id, data) {
        let updateObject = { updateTime: moment().unix() };
        if (isArray(data.scenes)) {
            updateObject['scenes'] = data.scenes;
        }
        if (!isEmpty(data.background)) {
            updateObject['background'] = data.background;
        }
        if (!isEmpty(data.name)) {
            updateObject['name'] = data.name;
        }
        if (!isEmpty(data.description)) {
            updateObject['description'] = data.description;
        }
        if (isNumber(data.price)) {
            updateObject['price'] = data.price;
        }
        if (!isEmpty(data.author)) {
            updateObject['author'] = data.author;
        }
        if (!isEmpty(data.audio)) {
            updateObject['audio'] = data.audio;
        }
        if (!isEmpty(data.copy)) {
            updateObject['copy'] = data.copy;
        }
        if (!isEmpty(data.status)) {
            updateObject['status'] = data.status;
        }
        return await this.natureModel.findOneAndUpdate({ _id: id }, updateObject).exec()
    }

    async deleteNature(id) {
        return await this.natureModel.findOneAndUpdate({ _id: id }, { $bit: { status: { or: 0b000000000000000000000000000000001 } } }).exec()
    }

    async revertDeletedNature(id) {
        return await this.natureModel.findOneAndUpdate({ _id: id }, { $bit: { status: { and: 0b001111111111111111111111111111110 } } }).exec()
    }

    async favoriteNature(userId, natureId) {
        let result = await this.natureRecordModel.findOneAndUpdate({
            userId: userId,
            natureId: natureId
        }, { $inc: { favorite: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.producer.send(JSON.stringify({
                type: 'nature',
                userId: userId,
                natureId: natureId
            }), ['favorite'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result

    }

    async startNature(userId, natureId) {
        let result = await this.natureRecordModel.findOneAndUpdate({ userId: userId, natureId: natureId },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.producer.send(JSON.stringify({
                type: 'nature',
                userId: userId,
                natureId: natureId
            }), ['start'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async finishNature(userId, natureId, duration) {
        let currentRecord = await this.natureRecordModel.findOne({ userId: userId, natureId: natureId });
        let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } }
        if (duration > currentRecord.longestDuration) {
            updateObj.$set['longestDuration'] = duration
        }
        let result = await this.natureRecordModel.findOneAndUpdate({ userId: userId, natureId: natureId },
            updateObj,
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.producer.send(JSON.stringify({
                type: 'nature',
                userId: userId,
                natureId: natureId,
                duration: duration
            }), ['finish'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async buyNature(userId, natureId) {
        const oldNature = await this.natureRecordModel.findOne({ userId: userId, natureId: natureId }).exec();
        if (oldNature && oldNature.boughtTime !== 0)
            throw new RpcException({ code: 400, message: t('already bought') });
        let result = await this.natureRecordModel.findOneAndUpdate(
            { userId: userId, natureId: natureId },
            { $set: { boughtTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.producer.send(JSON.stringify({
                type: 'nature',
                userId: userId,
                natureId: natureId
            }), ['buy'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async searchNature(keyword, from, size) {
        let res = await this.elasticsearchService.search({
            index: 'nature',
            type: 'nature',
            body: {
                from: from,
                size: size,
                query: {
                    bool: {
                        should: [
                            { match: { name: keyword } },
                            { match: { description: keyword } },
                            { match: { copy: keyword } },]
                    }
                },
                // sort: {
                //     createTime: { order: "desc" }
                // }
            }
        }).toPromise();

        const ids = res[0].hits.hits.map(hit=>hit._id);
        return { total: res[0].hits.total, data: await this.getNatureByIds(ids) }
    }
}
