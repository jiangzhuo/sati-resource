import * as Sentry from '@sentry/node';
import * as nodejieba from 'nodejieba';
import { Model, Connection } from 'mongoose';
import { Mindfulness } from "../interfaces/mindfulness.interface";
import { User } from "../interfaces/user.interface";
import { Account } from "../interfaces/account.interface";
import { MindfulnessRecord } from "../interfaces/mindfulnessRecord.interface";
// import { MindfulnessTransaction } from "../interfaces/mindfulnessTransaction.interface";
// import { User } from "../interfaces/user.interface"
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';

// import { NotaddGrpcClientFactory } from '../grpc/grpc.client-factory';

// import { ObjectId } from 'mongodb';
import * as moment from 'moment';
import { isEmpty, isNumber, isArray, isBoolean, isString } from 'lodash';
// import { RpcException } from "@nestjs/microservices";
// import { __ as t } from "i18n";
// import { MessageQueueService } from "../modules/messageQueue.service";
// import { Producer } from 'ali-ons';
// import {InjectProducer} from 'nestjs-ali-ons';
import * as Moleculer from "moleculer";
import MoleculerError = Moleculer.Errors.MoleculerError;
import { toArray } from "rxjs/operators";

@Injectable()
export class MindfulnessService {
    onModuleInit() {
        // this.userServiceInterface = this.notaddGrpcClientFactory.userModuleClient.getService('UserService');
    }

    constructor(
        @InjectConnection('sati') private readonly resourceClient: Connection,
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Account') private readonly accountModel: Model<Account>,
        @InjectModel('Mindfulness') private readonly mindfulnessModel: Model<Mindfulness>,
        @InjectModel('MindfulnessRecord') private readonly mindfulnessRecordModel: Model<MindfulnessRecord>
    ) {
    }

    // private userServiceInterface;

    async sayHello(name: string) {
        return { msg: `Mindfulness Hello ${ name }!` };
    }

    async getMindfulness(first = 20, after?: number, before?: number, status = 1) {
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
        return await this.mindfulnessModel.find(
            condition,
            null,
            { sort: sort }
        ).limit(Math.abs(first)).exec();
    }

    async getMindfulnessById(id) {
        return await this.mindfulnessModel.findOne({ _id: id }).exec()
    }

    async getMindfulnessByIds(ids) {
        return await this.mindfulnessModel.find({ _id: { $in: ids } }).exec()
    }

    async getMindfulnessRecord(userId: string, mindfulnessId: string);
    async getMindfulnessRecord(userId: string, mindfulnessId: string[]);
    async getMindfulnessRecord(userId, mindfulnessId) {
        if (isArray(mindfulnessId)) {
            return await this.mindfulnessRecordModel.find({
                userId: userId,
                mindfulnessId: { $in: mindfulnessId }
            }).exec()
        } else if (typeof mindfulnessId === 'string') {
            return await this.mindfulnessRecordModel.findOne({ userId: userId, mindfulnessId: mindfulnessId }).exec()
        }
    }

    async searchMindfulnessRecord(userId: string, page: number, limit: number, sort: string, favorite?: boolean, boughtTime?: number[]) {
        let conditions = {};
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
        return await this.mindfulnessRecordModel.find(
            conditions,
            null,
            { sort: sort, limit: limit, skip: (page - 1) * limit }).exec()
    }

    async createMindfulness(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        let result = await this.mindfulnessModel.create(data);
        await this.updateTag(result._id);
        return result;
    }

    async updateTag(id) {
        const doc = await this.mindfulnessModel.findOne({ _id: id }).exec();
        const nameCut = nodejieba.cut(doc.name);
        const descriptionCut = nodejieba.cut(doc.description);
        const copyCut = nodejieba.cut(doc.copy);
        await this.mindfulnessModel.updateOne({ _id: id }, { __tag: ['*'].concat(nameCut).concat(descriptionCut).concat(copyCut) }).exec();
    }

    async updateMindfulness(id, data) {
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
        if (isArray(data.mindfulnessAlbums)) {
            updateObject['mindfulnessAlbums'] = data.mindfulnessAlbums;
        }
        if (isNumber(data.validTime)) {
            updateObject['validTime'] = data.validTime;
        }
        if (!isEmpty(data.natureId)) {
            updateObject['natureId'] = data.natureId;
        }
        // console.log(updateObject)
        let result = await this.mindfulnessModel.findOneAndUpdate({ _id: id }, updateObject, { new: true }).exec();
        await this.updateTag(result.id);
        return result
    }

    async deleteMindfulness(id) {
        return await this.mindfulnessModel.findOneAndUpdate({ _id: id }, { $bit: { status: { or: 0b000000000000000000000000000000001 } } }).exec()
    }

    async revertDeletedMindfulness(id) {
        return await this.mindfulnessModel.findOneAndUpdate({ _id: id }, { $bit: { status: { and: 0b001111111111111111111111111111110 } } }).exec()
    }

    async favoriteMindfulness(userId, mindfulnessId) {
        let result = await this.mindfulnessRecordModel.findOneAndUpdate({
            userId: userId,
            mindfulnessId: mindfulnessId
        }, { $inc: { favorite: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
        return result
    }

    async startMindfulness(userId, mindfulnessId) {
        let result = await this.mindfulnessRecordModel.findOneAndUpdate({
                userId: userId,
                mindfulnessId: mindfulnessId
            },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
        return result
    }

    async finishMindfulness(userId, mindfulnessId, duration) {
        let currentRecord = await this.mindfulnessRecordModel.findOne({ userId: userId, mindfulnessId: mindfulnessId });
        let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } }
        if (duration > currentRecord.longestDuration) {
            updateObj.$set['longestDuration'] = duration
        }
        let result = await this.mindfulnessRecordModel.findOneAndUpdate({
                userId: userId,
                mindfulnessId: mindfulnessId
            },
            updateObj,
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
        return result
    }

    async buyMindfulness(userId, mindfulnessId, discount) {
        let discountVal = 100;
        if (discount) {
            discountVal = discount.discount
        }
        // 检查有没有这个mindfulness
        const mindfulness = await this.getMindfulnessById(mindfulnessId);
        if (!mindfulness) throw new MoleculerError('not have this mindfulness', 404);
        // 检查是不是买过
        const oldMindfulness = await this.mindfulnessRecordModel.findOne({
            userId: userId,
            mindfulnessId: mindfulnessId
        }).exec();
        if (oldMindfulness && oldMindfulness.boughtTime !== 0)
            throw new MoleculerError('already bought', 400);

        let finalPrice = Math.floor(mindfulness.price * discountVal / 100);

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
                type: 'mindfulness',
                createTime: moment().unix(),
                extraInfo: JSON.stringify({ resource: mindfulness, discount: discount }),
            }], { session: session });
            const mindfulnessRecord = await this.mindfulnessRecordModel.findOneAndUpdate(
                { userId: userId, mindfulnessId: mindfulnessId },
                { $set: { boughtTime: moment().unix() } },
                { upsert: true, new: true, setDefaultsOnInsert: true }).session(session).exec();
            await session.commitTransaction();
            session.endSession();

            return mindfulnessRecord
        } catch (error) {
            // If an error occurred, abort the whole transaction and
            // undo any changes that might have happened
            await session.abortTransaction();
            session.endSession();
            throw error; // Rethrow so calling function sees error
        }
    }

    async searchMindfulness(keyword, from, size) {
        const cutKeyword = nodejieba.cut(keyword);
        let query = {};
        if (cutKeyword.length !== 0) {
            query = { __tag: { $in: cutKeyword } };
        }
        let total = await this.mindfulnessModel.countDocuments(query);
        let data = await this.mindfulnessModel.find(query).skip(from).limit(size).exec();
        return { total, data };
    }

    async getMindfulnessByMindfulnessAlbumId(id) {
        return await this.mindfulnessModel.find({ mindfulnessAlbums: id }).exec();
    }
}
