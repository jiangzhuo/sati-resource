import { Model, Connection } from 'mongoose';
import { Nature } from "../interfaces/nature.interface";
import { NatureAlbum } from "../interfaces/natureAlbum.interface";
import { NatureRecord } from "../interfaces/natureRecord.interface";
import { NatureAlbumRecord } from "../interfaces/natureAlbumRecord.interface";
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import * as moment from "moment";
import { isEmpty, isNumber, isArray, isBoolean } from 'lodash';
// import { RpcException } from "@nestjs/microservices";
// import { __ as t } from "i18n";
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as Moleculer from "moleculer";
import MoleculerError = Moleculer.Errors.MoleculerError;
import { User } from 'src/interfaces/user.interface';
import { Account } from "../interfaces/account.interface";

@Injectable()
export class NatureAlbumService {
    constructor(
        @Inject(ElasticsearchService) private readonly elasticsearchService: ElasticsearchService,
        @InjectConnection('sati') private readonly resourceClient: Connection,
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Account') private readonly accountModel: Model<Account>,
        @InjectModel('Nature') private readonly natureModel: Model<Nature>,
        @InjectModel('NatureAlbum') private readonly natureAlbumModel: Model<NatureAlbum>,
        @InjectModel('NatureAlbumRecord') private readonly natureAlbumRecordModel: Model<NatureAlbumRecord>
    ) {
    }

    async sayHello(name: string) {
        return { msg: `Nature Hello ${ name }!` };
    }

    async getNatureAlbum(first = 20, after?: number, before?: number, status = 1) {
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
        return await this.natureAlbumModel.find(
            condition,
            null,
            { sort: sort }
        ).limit(Math.abs(first)).exec();
    }

    async getNatureAlbumById(id) {
        return await this.natureAlbumModel.findOne({ _id: id }).exec()
    }

    async getNatureAlbumByIds(ids) {
        return await this.natureAlbumModel.find({ _id: { $in: ids } }).exec()
    }

    async getNatureAlbumRecord(userId: string, natureAlbumId: string);
    async getNatureAlbumRecord(userId: string, natureAlbumId: string[]);
    async getNatureAlbumRecord(userId, natureAlbumId) {
        if (isArray(natureAlbumId)) {
            return await this.natureAlbumRecordModel.find({
                userId: userId,
                natureAlbumId: { $in: natureAlbumId }
            }).exec()
        } else if (typeof natureAlbumId === 'string') {
            return await this.natureAlbumRecordModel.findOne({ userId: userId, natureAlbumId: natureAlbumId }).exec()
        }
    }

    async searchNatureAlbumRecord(userId: string, page: number, limit: number, sort: string, favorite?: boolean, boughtTime?: number[]) {
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
        return await this.natureAlbumRecordModel.find(
            conditions,
            null,
            { sort: sort, limit: limit, skip: (page - 1) * limit }).exec()
    }

    async createNatureAlbum(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        return await this.natureAlbumModel.create(data)
    }

    async updateNatureAlbum(id, data) {
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
        return await this.natureAlbumModel.findOneAndUpdate({ _id: id }, updateObject, { new: true }).exec()
    }

    async deleteNatureAlbum(id) {
        // await this.natureModel.updateMany({ natureAlbums: id }, { $pull: { natureAlbums: id } }).exec();
        return await this.natureAlbumModel.findOneAndUpdate({ _id: id }, { $bit: { status: { or: 0b000000000000000000000000000000001 } } }).exec()
    }

    async revertDeletedNatureAlbum(id) {
        // await this.natureModel.updateMany({ natureAlbums: id }, { $pull: { natureAlbums: id } }).exec();
        return await this.natureAlbumModel.findOneAndUpdate({ _id: id }, { $bit: { status: { and: 0b001111111111111111111111111111110 } } }).exec()
    }

    async favoriteNatureAlbum(userId, natureAlbumId) {
        let result = await this.natureAlbumRecordModel.findOneAndUpdate({
            userId: userId,
            natureAlbumId: natureAlbumId
        }, { $inc: { favorite: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        return result
    }

    async startNatureAlbum(userId, natureAlbumId) {
        let result = await this.natureAlbumRecordModel.findOneAndUpdate({
                userId: userId,
                natureAlbumId: natureAlbumId
            },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        return result
    }

    async finishNatureAlbum(userId, natureAlbumId, duration) {
        let currentRecord = await this.natureAlbumRecordModel.findOne({ userId: userId, natureAlbumId: natureAlbumId });
        let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } }
        if (duration > currentRecord.longestDuration) {
            updateObj.$set['longestDuration'] = duration
        }
        let result = await this.natureAlbumRecordModel.findOneAndUpdate({
                userId: userId,
                natureAlbumId: natureAlbumId
            },
            updateObj,
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        return result
    }

    async buyNatureAlbum(userId, natureAlbumId) {
        // 检查有没有这个nature
        const natureAlbum = await this.getNatureAlbumById(natureAlbumId);
        if (!natureAlbum) throw new MoleculerError('not have this natureAlbum', 404);
        // 检查是不是买过
        const oldNatureAlbum = await this.natureAlbumRecordModel.findOne({
            userId: userId,
            natureAlbumId: natureAlbumId
        }).exec();
        if (oldNatureAlbum && oldNatureAlbum.boughtTime !== 0)
            throw new MoleculerError('already bought', 400);

        const session = await this.resourceClient.startSession();
        session.startTransaction();
        try {
            const user = await this.userModel.findOneAndUpdate({
                _id: userId,
                balance: { $gte: natureAlbum.price }
            }, { $inc: { balance: -1 * natureAlbum.price } }, { new: true }).session(session).exec();
            if (!user) throw new MoleculerError('not enough balance', 402);
            await this.accountModel.create([{
                userId: userId,
                value: -1 * natureAlbum.price,
                afterBalance: user.balance,
                type: 'natureAlbum',
                createTime: moment().unix(),
                extraInfo: JSON.stringify(natureAlbum),
            }], { session: session });
            const natureAlbumRecord = await this.natureAlbumRecordModel.findOneAndUpdate(
                { userId: userId, natureAlbumId: natureAlbumId },
                { $set: { boughtTime: moment().unix() } },
                { upsert: true, new: true, setDefaultsOnInsert: true }).session(session).exec();
            await session.commitTransaction();
            session.endSession();

            return natureAlbumRecord
        } catch (error) {
            // If an error occurred, abort the whole transaction and
            // undo any changes that might have happened
            await session.abortTransaction();
            session.endSession();
            throw error; // Rethrow so calling function sees error
        }
    }

    async searchNatureAlbum(keyword, from, size) {
        let res = await this.elasticsearchService.search({
            index: 'nature_album',
            type: 'nature_album',
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

        const ids = res[0].hits.hits.map(hit => hit._id);
        return { total: res[0].hits.total, data: await this.getNatureAlbumByIds(ids) };
    }
}
