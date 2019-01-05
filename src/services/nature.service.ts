import { Connection, Model } from 'mongoose';
import { Nature } from "../interfaces/nature.interface";
import { NatureRecord } from "../interfaces/natureRecord.interface";
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import * as moment from "moment";
import { isEmpty, isNumber, isArray, isBoolean } from 'lodash';
import { RpcException } from "@nestjs/microservices";
// import { __ as t } from "i18n";
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Errors } from "moleculer";
import MoleculerError = Errors.MoleculerError;
import * as Sentry from "@sentry/node";
import { User } from "../interfaces/user.interface";
import { Account } from "../interfaces/account.interface";

@Injectable()
export class NatureService {
    constructor(
        @Inject(ElasticsearchService) private readonly elasticsearchService: ElasticsearchService,
        @InjectConnection('sati') private readonly resourceClient: Connection,
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Account') private readonly accountModel: Model<Account>,
        @InjectModel('Nature') private readonly natureModel: Model<Nature>,
        @InjectModel('NatureRecord') private readonly natureRecordModel: Model<NatureRecord>
    ) { }

    async sayHello(name: string) {
        return { msg: `Nature Hello ${name}!` };
    }

    async getNature(first = 20, after?: number, before?: number, status = 1) {
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
        return await this.natureModel.find(
            condition,
            null,
            { sort: sort }
        ).limit(Math.abs(first)).exec();
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
        if (!isEmpty(data.copy)) {
            updateObject['copy'] = data.copy;
        }
        if (isNumber(data.status)) {
            updateObject['status'] = data.status;
        }
        if (isArray(data.natureAlbums)) {
            updateObject['natureAlbums'] = data.natureAlbums;
        }
        if (isNumber(data.validTime)) {
            updateObject['validTime'] = data.validTime;
        }
        return await this.natureModel.findOneAndUpdate({ _id: id }, updateObject, { new: true }).exec()
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
        return result

    }

    async startNature(userId, natureId) {
        let result = await this.natureRecordModel.findOneAndUpdate({ userId: userId, natureId: natureId },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
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
        return result
    }

    async buyNature(userId, natureId) {
        // const oldNature = await this.natureRecordModel.findOne({ userId: userId, natureId: natureId }).exec();
        // if (oldNature && oldNature.boughtTime !== 0)
        //     // throw new RpcException({ code: 400, message: t('already bought') });
        //     throw new MoleculerError('already bought', 400);
        // let result = await this.natureRecordModel.findOneAndUpdate(
        //     { userId: userId, natureId: natureId },
        //     { $set: { boughtTime: moment().unix() } },
        //     { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        // try {
        //     await this.producer.send(JSON.stringify({
        //         type: 'nature',
        //         userId: userId,
        //         natureId: natureId
        //     }), ['buy'])
        // } catch (e) {
        //     // todo sentry
        //     console.error(e)
        // }
        // return result


        // 检查有没有这个nature
        const nature = await this.getNatureById(natureId);
        if (!nature) throw new MoleculerError('not have this nature', 404);
        // 检查是不是买过
        const oldNature = await this.natureRecordModel.findOne({
            userId: userId,
            natureId: natureId
        }).exec();
        if (oldNature && oldNature.boughtTime !== 0)
            throw new MoleculerError('already bought', 400);
        let result = await this.natureRecordModel.findOneAndUpdate(
            { userId: userId, natureId: natureId },
            { $set: { boughtTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        return result

        const session = await this.resourceClient.startSession();
        session.startTransaction();
        try {
            const user = await this.userModel.findOneAndUpdate({
                _id: userId,
                balance: { $gte: nature.price }
            }, { $inc: { balance: -1 * nature.price } }, { new: true }).session(session).exec();
            if (!user) throw new MoleculerError('not enough balance', 402);
            await this.accountModel.create([{
                userId: userId,
                value: -1 * nature.price,
                afterBalance: user.balance,
                type: 'nature',
                createTime: moment().unix(),
                extraInfo: JSON.stringify(nature),
            }], { session: session });
            const natureRecord = await this.natureRecordModel.findOneAndUpdate(
                { userId: userId, natureId: natureId },
                { $set: { boughtTime: moment().unix() } },
                { upsert: true, new: true, setDefaultsOnInsert: true }).session(session).exec();
            await session.commitTransaction();
            session.endSession();

            try {
                await this.producer.send(JSON.stringify({
                    type: 'nature',
                    userId: userId,
                    natureId: natureId
                }), ['buy'])
            } catch (e) {
                Sentry.captureException(e)
            }
            return natureRecord
        } catch (error) {
            // If an error occurred, abort the whole transaction and
            // undo any changes that might have happened
            await session.abortTransaction();
            session.endSession();
            throw error; // Rethrow so calling function sees error
        }
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
        return { total: res[0].hits.total, data: await this.getNatureByIds(ids) }
    }

    async getNatureByNatureAlbumId(id) {
        return await this.natureModel.find({ natureAlbums: id }).exec();
    }
}
