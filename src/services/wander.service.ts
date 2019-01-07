import { Connection, Model } from 'mongoose';
import { Wander } from "../interfaces/wander.interface";
import { WanderAlbum } from "../interfaces/wanderAlbum.interface";
import { WanderRecord } from "../interfaces/wanderRecord.interface";
import { WanderAlbumRecord } from "../interfaces/wanderAlbumRecord.interface";
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import * as moment from "moment";
import { isEmpty, isNumber, isArray, isBoolean } from 'lodash';
import { RpcException } from "@nestjs/microservices";
// import { __ as t } from "i18n";
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as Moleculer from "moleculer";
import MoleculerError = Moleculer.Errors.MoleculerError;
import { User } from "../interfaces/user.interface";
import { Account } from "../interfaces/account.interface";
import * as Sentry from "@sentry/node";

@Injectable()
export class WanderService {
    constructor(
        @Inject(ElasticsearchService) private readonly elasticsearchService: ElasticsearchService,
        @InjectConnection('sati') private readonly resourceClient: Connection,
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Account') private readonly accountModel: Model<Account>,
        @InjectModel('Wander') private readonly wanderModel: Model<Wander>,
        @InjectModel('WanderAlbum') private readonly wanderAlbumModel: Model<WanderAlbum>,
        @InjectModel('WanderRecord') private readonly wanderRecordModel: Model<WanderRecord>,
        @InjectModel('WanderAlbumRecord') private readonly wanderAlbumRecordModel: Model<WanderAlbumRecord>
    ) { }

    async sayHello(name: string) {
        return { msg: `Wander Hello ${name}!` };
    }

    async getWander(first = 20, after?: number, before?: number, status = 1) {
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
        return await this.wanderModel.find(
            condition,
            null,
            { sort: sort }
        ).limit(Math.abs(first)).exec();
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
        if (isNumber(data.status)) {
            updateObject['status'] = data.status;
        }
        if (isArray(data.wanderAlbums)) {
            updateObject['wanderAlbums'] = data.wanderAlbums;
        }
        if (isNumber(data.validTime)) {
            updateObject['validTime'] = data.validTime;
        }
        return await this.wanderModel.findOneAndUpdate({ _id: id }, updateObject, { new: true }).exec()
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
        return result
    }

    async startWander(userId, wanderId) {
        let result = await this.wanderRecordModel.findOneAndUpdate({ userId: userId, wanderId: wanderId },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
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
        return result
    }

    async buyWander(userId, wanderId, discount) {
        let discountVal = 100;
        if (discount) {
            discountVal = discount.discount
        }
        // 检查有没有这个wander
        const wander = await this.getWanderById(wanderId);
        if (!wander) throw new MoleculerError('not have this wander', 404);
        // 检查是不是买过
        const oldWander = await this.wanderRecordModel.findOne({
            userId: userId,
            wanderId: wanderId
        }).exec();
        if (oldWander && oldWander.boughtTime !== 0)
            throw new MoleculerError('already bought', 400);

        let finalPrice = Math.floor(wander.price * discountVal / 100);

        const session = await this.resourceClient.startSession();
        session.startTransaction();
        try {
            const user = await this.userModel.findOneAndUpdate({
                _id: userId,
                balance: { $gte: finalPrice }
            }, { $inc: { balance: -1 * finalPrice } }, { new: true }).session(session).exec();
            if (!user) throw new MoleculerError('not enough balance', 402);
            await this.accountModel.create([{
                userId: userId,
                value: -1 * finalPrice,
                afterBalance: user.balance,
                type: 'wander',
                createTime: moment().unix(),
                extraInfo: JSON.stringify({ resource: wander, discount: discount }),
            }], { session: session });
            const wanderRecord = await this.wanderRecordModel.findOneAndUpdate(
                { userId: userId, wanderId: wanderId },
                { $set: { boughtTime: moment().unix() } },
                { upsert: true, new: true, setDefaultsOnInsert: true }).session(session).exec();
            await session.commitTransaction();
            session.endSession();

            return wanderRecord
        } catch (error) {
            // If an error occurred, abort the whole transaction and
            // undo any changes that might have happened
            await session.abortTransaction();
            session.endSession();
            throw error; // Rethrow so calling function sees error
        }
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
        return result
    }

    async startWanderAlbum(userId, wanderAlbumId) {
        let result = await this.wanderAlbumRecordModel.findOneAndUpdate({ userId: userId, wanderAlbumId: wanderAlbumId },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
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
        return result
    }

    async buyWanderAlbum(userId, wanderAlbumId) {
        // 检查有没有这个wanderAlbum
        const wanderAlbum = await this.getWanderAlbumById(wanderAlbumId);
        if (!wanderAlbum) throw new MoleculerError('not have this wanderAlbum', 404);
        // 检查是不是买过
        const oldWanderAlbum = await this.wanderAlbumRecordModel.findOne({
            userId: userId,
            wanderAlbumId: wanderAlbumId
        }).exec();
        if (oldWanderAlbum && oldWanderAlbum.boughtTime !== 0)
            throw new MoleculerError('already bought', 400);

        const session = await this.resourceClient.startSession();
        session.startTransaction();
        try {
            const user = await this.userModel.findOneAndUpdate({
                _id: userId,
                balance: { $gte: wanderAlbum.price }
            }, { $inc: { balance: -1 * wanderAlbum.price } }, { new: true }).session(session).exec();
            if (!user) throw new MoleculerError('not enough balance', 402);
            await this.accountModel.create([{
                userId: userId,
                value: -1 * wanderAlbum.price,
                afterBalance: user.balance,
                type: 'wanderAlbum',
                createTime: moment().unix(),
                extraInfo: JSON.stringify(wanderAlbum),
            }], { session: session });
            const wanderAlbumRecord = await this.wanderAlbumRecordModel.findOneAndUpdate(
                { userId: userId, wanderAlbumId: wanderAlbumId },
                { $set: { boughtTime: moment().unix() } },
                { upsert: true, new: true, setDefaultsOnInsert: true }).session(session).exec();
            await session.commitTransaction();
            session.endSession();

            return wanderAlbumRecord
        } catch (error) {
            // If an error occurred, abort the whole transaction and
            // undo any changes that might have happened
            await session.abortTransaction();
            session.endSession();
            throw error; // Rethrow so calling function sees error
        }
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
                            { wildcard: { name: keyword } },
                            { wildcard: { description: keyword } },
                            { wildcard: { copy: keyword } },]
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

    async getWanderByWanderAlbumId(id) {
        return await this.wanderModel.find({ wanderAlbums: id }).exec();
    }
}
