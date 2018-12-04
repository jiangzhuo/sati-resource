import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from "moment";
import { isArray, isBoolean, isEmpty, isNumber } from 'lodash';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Producer } from 'ali-ons';
import { InjectProducer } from 'nestjs-ali-ons';
import * as Moleculer from "moleculer";
import { MindfulnessAlbum } from "../interfaces/mindfulnessAlbum.interface";
import { MindfulnessAlbumRecord } from 'src/interfaces/mindfulnessAlbumRecord.interface';
import MoleculerError = Moleculer.Errors.MoleculerError;

@Injectable()
export class MindfulnessAlbumService {
    constructor(
        @InjectProducer('sati_debug', 'mindfulness_album') private readonly mindfulnessAlbumProducer: Producer,
        @Inject(ElasticsearchService) private readonly elasticsearchService: ElasticsearchService,
        @InjectModel('MindfulnessAlbum') private readonly mindfulnessAlbumModel: Model<MindfulnessAlbum>,
        @InjectModel('MindfulnessAlbumRecord') private readonly mindfulnessAlbumRecordModel: Model<MindfulnessAlbumRecord>
    ) {
    }

    async sayHello(name: string) {
        return { msg: `Mindfulness Hello ${ name }!` };
    }

    async getMindfulnessAlbum(first = 20, after?: number, before?: number, status = 1) {
        const condition = {};
        if (after) {
            condition['validTime'] = { $gt: after }
        }
        if (before) {
            if (condition['validTime']) {
                condition['validTime']['$lt'] = before
            } else {
                condition['validTime'] = { $lt: before }
            }
        }
        if (status !== 0) {
            condition['status'] = { $bitsAllClear: status }
        }
        let sort = { validTime: 1 };
        if (first < 0) {
            sort = { validTime: -1 }
        }
        return await this.mindfulnessAlbumModel.find(
            condition,
            null,
            { sort: sort }
        ).limit(Math.abs(first)).exec();
    }

    async getMindfulnessAlbumById(id) {
        return await this.mindfulnessAlbumModel.findOne({ _id: id }).exec()
    }

    async getMindfulnessAlbumByIds(ids) {
        return await this.mindfulnessAlbumModel.find({ _id: { $in: ids } }).exec()
    }

    async getMindfulnessAlbumRecord(userId: string, mindfulnessAlbumId: string);
    async getMindfulnessAlbumRecord(userId: string, mindfulnessAlbumId: string[]);
    async getMindfulnessAlbumRecord(userId, mindfulnessAlbumId) {
        if (isArray(mindfulnessAlbumId)) {
            return await this.mindfulnessAlbumRecordModel.find({
                userId: userId,
                mindfulnessAlbumId: { $in: mindfulnessAlbumId }
            }).exec()
        } else if (typeof mindfulnessAlbumId === 'string') {
            return await this.mindfulnessAlbumRecordModel.findOne({
                userId: userId,
                mindfulnessAlbumId: mindfulnessAlbumId
            }).exec()
        }
    }

    async searchMindfulnessAlbumRecord(userId: string, page: number, limit: number, sort: string, favorite?: boolean, boughtTime?: number[]) {
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
        return await this.mindfulnessAlbumRecordModel.find(
            conditions,
            null,
            { sort: sort, limit: limit, skip: (page - 1) * limit }).exec()
    }

    async createMindfulnessAlbum(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        return await this.mindfulnessAlbumModel.create(data)
    }

    async updateMindfulnessAlbum(id, data) {
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
        if (isNumber(data.status)) {
            updateObject['status'] = data.status;
        }
        if (isNumber(data.validTime)) {
            updateObject['validTime'] = data.validTime;
        }
        return await this.mindfulnessAlbumModel.findOneAndUpdate({ _id: id }, updateObject, { new: true }).exec()
    }

    async deleteMindfulnessAlbum(id) {
        // await this.mindfulnessModel.updateMany({ mindfulnessAlbums: id }, { $pull: { mindfulnessAlbums: id } }).exec();
        return await this.mindfulnessAlbumModel.findOneAndUpdate({ _id: id }, { $bit: { status: { or: 0b000000000000000000000000000000001 } } }).exec()
    }

    async revertDeletedMindfulnessAlbum(id) {
        // await this.mindfulnessModel.updateMany({ mindfulnessAlbums: id }, { $pull: { mindfulnessAlbums: id } }).exec();
        return await this.mindfulnessAlbumModel.findOneAndUpdate({ _id: id }, { $bit: { status: { and: 0b001111111111111111111111111111110 } } }).exec()
    }

    async favoriteMindfulnessAlbum(userId, mindfulnessAlbumId) {
        let result = await this.mindfulnessAlbumRecordModel.findOneAndUpdate({
            userId: userId,
            mindfulnessAlbumId: mindfulnessAlbumId
        }, { $inc: { favorite: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.mindfulnessAlbumProducer.send(JSON.stringify({
                type: 'mindfulnessAlbum',
                userId: userId,
                mindfulnessAlbumId: mindfulnessAlbumId
            }), ['favorite'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async startMindfulnessAlbum(userId, mindfulnessAlbumId) {
        let result = await this.mindfulnessAlbumRecordModel.findOneAndUpdate({
                userId: userId,
                mindfulnessAlbumId: mindfulnessAlbumId
            },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.mindfulnessAlbumProducer.send(JSON.stringify({
                type: 'mindfulnessAlbum',
                userId: userId,
                mindfulnessAlbumId: mindfulnessAlbumId
            }), ['start'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async finishMindfulnessAlbum(userId, mindfulnessAlbumId, duration) {
        let currentRecord = await this.mindfulnessAlbumRecordModel.findOne({
            userId: userId,
            mindfulnessAlbumId: mindfulnessAlbumId
        });
        let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } }
        if (duration > currentRecord.longestDuration) {
            updateObj.$set['longestDuration'] = duration
        }
        let result = await this.mindfulnessAlbumRecordModel.findOneAndUpdate({
                userId: userId,
                mindfulnessAlbumId: mindfulnessAlbumId
            },
            updateObj,
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.mindfulnessAlbumProducer.send(JSON.stringify({
                type: 'mindfulnessAlbum',
                userId: userId,
                mindfulnessAlbumId: mindfulnessAlbumId,
                duration: duration
            }), ['finish'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async buyMindfulnessAlbum(userId, mindfulnessAlbumId) {
        const oldMindfulnessAlbum = await this.mindfulnessAlbumRecordModel.findOne({
            userId: userId,
            mindfulnessAlbumId: mindfulnessAlbumId
        }).exec();
        if (oldMindfulnessAlbum && oldMindfulnessAlbum.boughtTime !== 0)
        // throw new RpcException({ code: 400, message: t('already bought') });
            throw new MoleculerError('already bought', 400);
        let result = await this.mindfulnessAlbumRecordModel.findOneAndUpdate(
            { userId: userId, mindfulnessAlbumId: mindfulnessAlbumId },
            { $set: { boughtTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        try {
            await this.mindfulnessAlbumProducer.send(JSON.stringify({
                type: 'mindfulnessAlbum',
                userId: userId,
                mindfulnessAlbumId: mindfulnessAlbumId
            }), ['buy'])
        } catch (e) {
            // todo sentry
            console.error(e)
        }
        return result
    }

    async searchMindfulnessAlbum(keyword, from, size) {
        let res = await this.elasticsearchService.search({
            index: 'mindfulness_album',
            type: 'mindfulness_album',
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

        const ids = res[0].hits.hits.map(hit => hit._id);
        return { total: res[0].hits.total, data: await this.getMindfulnessAlbumByIds(ids) };
    }
}
