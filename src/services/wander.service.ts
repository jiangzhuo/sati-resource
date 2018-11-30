import { Model } from 'mongoose';
import { Wander } from "../interfaces/wander.interface";
import { WanderAlbum } from "../interfaces/wanderAlbum.interface";
import { WanderRecord } from "../interfaces/wanderRecord.interface";
import { WanderAlbumRecord } from "../interfaces/wanderAlbumRecord.interface";
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from "moment";
import { isEmpty, isNumber, isArray, isBoolean } from 'lodash';
import { RpcException } from "@nestjs/microservices";
// import { __ as t } from "i18n";
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Producer } from 'ali-ons';
import { InjectProducer } from 'nestjs-ali-ons';
import * as Moleculer from "moleculer";
import MoleculerError = Moleculer.Errors.MoleculerError;

@Injectable()
export class WanderService {
    constructor(
        @InjectProducer('sati_debug', 'wander') private readonly wanderProducer: Producer,
        @InjectProducer('sati_debug', 'wander_album') private readonly wanderAlbumProducer: Producer,
        @Inject(ElasticsearchService) private readonly elasticsearchService: ElasticsearchService,
        @InjectModel('Wander') private readonly wanderModel: Model<Wander>,
        @InjectModel('WanderAlbum') private readonly wanderAlbumModel: Model<WanderAlbum>,
        @InjectModel('WanderRecord') private readonly wanderRecordModel: Model<WanderRecord>,
        @InjectModel('WanderAlbumRecord') private readonly wanderAlbumRecordModel: Model<WanderAlbumRecord>
    ) { }

    async sayHello(name: string) {
        return { msg: `Wander Hello ${name}!` };
    }

    async getWander(first = 20, after?: string) {
        if (after) {
            return await this.wanderModel.find(
                { _id: { $lt: after } },
                null,
                { sort: '-_id' }).limit(first).exec();
        } else {
            return await this.wanderModel.find({}, null, { sort: '-_id' }).limit(first).exec();
        }
    }

    async getWanderById(id) {
        return await this.wanderModel.findOne({ _id: id }).exec();
    }

    async getWanderByIds(ids) {
        return await this.wanderModel.find({ _id: { $in: ids } }).exec();
    }

    async getWanderRecord(userId: string, wanderId: string);
    async getWanderRecord(userId: string, wanderId: string[]);
    async getWanderRecord(userId, wanderId) {
        if (isArray(wanderId)) {
            return await this.wanderRecordModel.find({
                userId: userId,
                wanderId: { $in: wanderId }
            }).exec()
        } else if (typeof wanderId === 'string') {
            return await this.wanderRecordModel.findOne({ userId: userId, wanderId: wanderId }).exec()
        }
    }

    async searchWanderRecord(userId: string, page: number, limit: number, sort: string, favorite?: boolean, boughtTime?: number[]) {
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
        return await this.wanderRecordModel.find(
            conditions,
            null,
            { sort: sort, limit: limit, skip: (page - 1) * limit }).exec()
    }

    async createWander(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        return await this.wanderModel.create(data)
    }

    async updateWander(id, data) {
        let updateObject = { updateTime: moment().unix() };
        if (isArray(data.scenes)) {
            updateObject['scenes'] = data.scenes;
        }
        if (isArray(data.background)) {
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
        if (!isEmpty(data.status)) {
            updateObject['status'] = data.status;
        }
        if (isArray(data.wanderAlbums)) {
            updateObject['wanderAlbums'] = data.wanderAlbums;
        }
        return await this.wanderModel.findOneAndUpdate({ _id: id }, updateObject).exec()
    }

    async deleteWander(id) {
        return await this.wanderModel.findOneAndUpdate({ _id: id }, { $bit: { status: { or: 0b000000000000000000000000000000001 } } }).exec()
    }

    async revertDeletedWander(id) {
        return await this.wanderModel.findOneAndUpdate({ _id: id }, { $bit: { status: { and: 0b001111111111111111111111111111110 } } }).exec()
    }

    async favoriteWander(userId, wanderId) {
        let result = await this.wanderRecordModel.findOneAndUpdate({
            userId: userId,
            wanderId: wanderId
        }, { $inc: { favorite: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.wanderProducer.send(JSON.stringify({
                type: 'wander',
                userId: userId,
                wanderId: wanderId
            }), ['favorite'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async startWander(userId, wanderId) {
        let result = await this.wanderRecordModel.findOneAndUpdate({ userId: userId, wanderId: wanderId },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.wanderProducer.send(JSON.stringify({
                type: 'wander',
                userId: userId,
                wanderId: wanderId
            }), ['start'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async finishWander(userId, wanderId, duration) {
        let currentRecord = await this.wanderRecordModel.findOne({ userId: userId, wanderId: wanderId });
        let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } }
        if (duration > currentRecord.longestDuration) {
            updateObj.$set['longestDuration'] = duration
        }
        let result = await this.wanderRecordModel.findOneAndUpdate({ userId: userId, wanderId: wanderId },
            updateObj,
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.wanderProducer.send(JSON.stringify({
                type: 'wander',
                userId: userId,
                wanderId: wanderId,
                duration: duration
            }), ['finish'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async buyWander(userId, wanderId) {
        const oldWander = await this.wanderRecordModel.findOne({ userId: userId, wanderId: wanderId }).exec();
        if (oldWander && oldWander.boughtTime !== 0)
        // throw new RpcException({ code: 400, message: t('already bought') });
            throw new MoleculerError('already bought', 400);
        let result = await this.wanderRecordModel.findOneAndUpdate(
            { userId: userId, wanderId: wanderId },
            { $set: { boughtTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.wanderProducer.send(JSON.stringify({
                type: 'wander',
                userId: userId,
                wanderId: wanderId
            }), ['buy'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async getWanderByWanderAlbumId(id) {
        return await this.wanderModel.find({ wanderAlbums: id }).exec();
    }

    async getWanderAlbum(first = 20, after?: string) {
        if (after) {
            return await this.wanderAlbumModel.find(
                { _id: { $lt: after } },
                null,
                { sort: '-_id' }).limit(first).exec();
        } else {
            return await this.wanderAlbumModel.find({}, null, { sort: '-_id' }).limit(first).exec();
        }
    }

    async getWanderAlbumById(id) {
        return await this.wanderAlbumModel.findOne({ _id: id }).exec()
    }

    async getWanderAlbumByIds(ids) {
        return await this.wanderAlbumModel.find({ _id: { $in: ids } }).exec()
    }

    async getWanderAlbumRecord(userId: string, wanderAlbumId: string);
    async getWanderAlbumRecord(userId: string, wanderAlbumId: string[]);
    async getWanderAlbumRecord(userId, wanderAlbumId) {
        if (isArray(wanderAlbumId)) {
            return await this.wanderAlbumRecordModel.find({
                userId: userId,
                wanderAlbumId: { $in: wanderAlbumId }
            }).exec()
        } else if (typeof wanderAlbumId === 'string') {
            return await this.wanderAlbumRecordModel.findOne({ userId: userId, wanderAlbumId: wanderAlbumId }).exec()
        }
    }

    async searchWanderAlbumRecord(userId: string, page: number, limit: number, sort: string, favorite?: boolean, boughtTime?: number[]) {
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
        return await this.wanderAlbumRecordModel.find(
            conditions,
            null,
            { sort: sort, limit: limit, skip: (page - 1) * limit }).exec()
    }

    async createWanderAlbum(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        return await this.wanderAlbumModel.create(data)
    }

    async updateWanderAlbum(id, data) {
        let updateObject = { updateTime: moment().unix() };
        if (!isEmpty(data.scenes)) {
            updateObject['scenes'] = data.scenes;
        }
        if (isArray(data.background)) {
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
        if (!isEmpty(data.copy)) {
            updateObject['copy'] = data.copy;
        }
        if (!isEmpty(data.status)) {
            updateObject['status'] = data.status;
        }
        return await this.wanderAlbumModel.findOneAndUpdate({ _id: id }, updateObject).exec()
    }

    async deleteWanderAlbum(id) {
        // await this.wanderModel.updateMany({ wanderAlbums: id }, { $pull: { wanderAlbums: id } }).exec();
        return await this.wanderAlbumModel.findOneAndUpdate({ _id: id }, { $bit: { status: { or: 0b000000000000000000000000000000001 } } }).exec()
    }

    async revertDeletedWanderAlbum(id) {
        // await this.wanderModel.updateMany({ wanderAlbums: id }, { $pull: { wanderAlbums: id } }).exec();
        return await this.wanderAlbumModel.findOneAndUpdate({ _id: id }, { $bit: { status: { and: 0b001111111111111111111111111111110 } } }).exec()
    }

    async favoriteWanderAlbum(userId, wanderAlbumId) {
        let result =await this.wanderAlbumRecordModel.findOneAndUpdate({
            userId: userId,
            wanderAlbumId: wanderAlbumId
        }, { $inc: { favorite: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.wanderAlbumProducer.send(JSON.stringify({
                type: 'wanderAlbum',
                userId: userId,
                wanderAlbumId: wanderAlbumId
            }), ['favorite'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async startWanderAlbum(userId, wanderAlbumId) {
        let result = await this.wanderAlbumRecordModel.findOneAndUpdate({ userId: userId, wanderAlbumId: wanderAlbumId },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.wanderAlbumProducer.send(JSON.stringify({
                type: 'wanderAlbum',
                userId: userId,
                wanderAlbumId: wanderAlbumId
            }), ['start'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async finishWanderAlbum(userId, wanderAlbumId, duration) {
        let currentRecord = await this.wanderAlbumRecordModel.findOne({ userId: userId, wanderAlbumId: wanderAlbumId });
        let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } }
        if (duration > currentRecord.longestDuration) {
            updateObj.$set['longestDuration'] = duration
        }
        let result = await this.wanderAlbumRecordModel.findOneAndUpdate({ userId: userId, wanderAlbumId: wanderAlbumId },
            updateObj,
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.wanderAlbumProducer.send(JSON.stringify({
                type: 'wanderAlbum',
                userId: userId,
                wanderAlbumId: wanderAlbumId,
                duration: duration
            }), ['finish'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async buyWanderAlbum(userId, wanderAlbumId) {
        const oldWanderAlbum = await this.wanderAlbumRecordModel.findOne({ userId: userId, wanderAlbumId: wanderAlbumId }).exec();
        if (oldWanderAlbum && oldWanderAlbum.boughtTime !== 0)
            // throw new RpcException({ code: 400, message: t('already bought') });
            throw new MoleculerError('already bought', 400);
        let result = await this.wanderAlbumRecordModel.findOneAndUpdate(
            { userId: userId, wanderAlbumId: wanderAlbumId },
            { $set: { boughtTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.wanderAlbumProducer.send(JSON.stringify({
                type: 'wanderAlbum',
                userId: userId,
                wanderAlbumId: wanderAlbumId
            }), ['buy'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async searchWander(keyword, from, size) {
        let res = await this.elasticsearchService.search({
            index: 'wander',
            type: 'wander',
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
        return { total: res[0].hits.total, data: await this.getWanderByIds(ids) };
    }

    async searchWanderAlbum(keyword, from, size) {
        let res = await this.elasticsearchService.search({
            index: 'wander_album',
            type: 'wander_album',
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
        return { total: res[0].hits.total, data: await this.getWanderAlbumByIds(ids) };
    }
}
