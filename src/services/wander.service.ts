import { Model } from 'mongoose';
import { Wander } from "../interfaces/wander.interface";
import { WanderAlbum } from "../interfaces/wanderAlbum.interface";
import { WanderRecord } from "../interfaces/wanderRecord.interface";
import { WanderAlbumRecord } from "../interfaces/wanderAlbumRecord.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from "moment";
import { isEmpty, isNumber, isArray, isBoolean } from 'lodash';
import { RpcException } from "@nestjs/microservices";
import { __ as t } from "i18n";

@Injectable()
export class WanderService {
    constructor(
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
                { _id: { $lte: after } },
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
        return await this.wanderRecordModel.findOneAndUpdate({
            userId: userId,
            wanderId: wanderId
        }, { $inc: { favorite: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async startWander(userId, wanderId) {
        return await this.wanderRecordModel.findOneAndUpdate({ userId: userId, wanderId: wanderId },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async finishWander(userId, wanderId, duration) {
        let currentRecord = await this.wanderRecordModel.findOne({ userId: userId, wanderId: wanderId });
        let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } }
        if (duration > currentRecord.longestDuration) {
            updateObj.$set['longestDuration'] = duration
        }
        return await this.wanderRecordModel.findOneAndUpdate({ userId: userId, wanderId: wanderId },
            updateObj,
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async buyWander(userId, wanderId) {
        const oldWander = await this.wanderRecordModel.findOne({ userId: userId, wanderId: wanderId }).exec();
        if (oldWander && oldWander.boughtTime !== 0)
            throw new RpcException({ code: 400, message: t('already bought') });
        return await this.wanderRecordModel.findOneAndUpdate(
            { userId: userId, wanderId: wanderId },
            { $set: { boughtTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async getWanderByWanderAlbumId(id) {
        return await this.wanderModel.find({ wanderAlbums: id }).exec();
    }

    async getWanderAlbum(first = 20, after?: string) {
        if (after) {
            return await this.wanderAlbumModel.find(
                { _id: { $lte: after } },
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
        return await this.wanderAlbumRecordModel.findOneAndUpdate({
            userId: userId,
            wanderAlbumId: wanderAlbumId
        }, { $inc: { favorite: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async startWanderAlbum(userId, wanderAlbumId) {
        return await this.wanderAlbumRecordModel.findOneAndUpdate({ userId: userId, wanderAlbumId: wanderAlbumId },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async finishWanderAlbum(userId, wanderAlbumId, duration) {
        let currentRecord = await this.wanderAlbumRecordModel.findOne({ userId: userId, wanderAlbumId: wanderAlbumId });
        let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } }
        if (duration > currentRecord.longestDuration) {
            updateObj.$set['longestDuration'] = duration
        }
        return await this.wanderAlbumRecordModel.findOneAndUpdate({ userId: userId, wanderAlbumId: wanderAlbumId },
            updateObj,
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async buyWanderAlbum(userId, wanderAlbumId) {
        const oldWanderAlbum = await this.wanderAlbumRecordModel.findOne({ userId: userId, wanderAlbumId: wanderAlbumId }).exec();
        if (oldWanderAlbum && oldWanderAlbum.boughtTime !== 0)
            throw new RpcException({ code: 400, message: t('already bought') });
        return await this.wanderAlbumRecordModel.findOneAndUpdate(
            { userId: userId, wanderAlbumId: wanderAlbumId },
            { $set: { boughtTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async searchWander(keyword) {
        return await this.wanderModel.find({ $or: [{ name: new RegExp(keyword, 'i') }, { description: new RegExp(keyword, 'i') }] }).exec();
    }

    async searchWanderAlbum(keyword) {
        return await this.wanderAlbumModel.find({ $or: [{ name: new RegExp(keyword, 'i') }, { description: new RegExp(keyword, 'i') }] }).exec();
    }
}
