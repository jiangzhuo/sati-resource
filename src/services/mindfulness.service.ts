import { Model } from 'mongoose';
import { Mindfulness } from "../interfaces/mindfulness.interface";
import { MindfulnessRecord } from "../interfaces/mindfulnessRecord.interface";
import { MindfulnessTransaction } from "../interfaces/mindfulnessTransaction.interface";
import { User } from "../interfaces/user.interface"
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { NotaddGrpcClientFactory } from '../grpc/grpc.client-factory';

import { ObjectId } from 'mongodb';
import * as moment from 'moment';
import { isEmpty, isNumber, isArray, isBoolean } from 'lodash';
import { RpcException } from "@nestjs/microservices";
import { __ as t } from "i18n";

@Injectable()
export class MindfulnessService {
    onModuleInit() {
        this.userServiceInterface = this.notaddGrpcClientFactory.userModuleClient.getService('UserService');
    }

    constructor(
        @InjectModel('Mindfulness') private readonly mindfulnessModel: Model<Mindfulness>,
        @InjectModel('MindfulnessRecord') private readonly mindfulnessRecordModel: Model<MindfulnessRecord>,
        @InjectModel('MindfulnessTransaction') private readonly mindfulnessTransactionModel: Model<MindfulnessTransaction>,
        @InjectModel('User') private readonly userModel: Model<User>,
        @Inject(NotaddGrpcClientFactory) private readonly notaddGrpcClientFactory: NotaddGrpcClientFactory
    ) { }

    private userServiceInterface;

    async sayHello(name: string) {
        return { msg: `Mindfulness Hello ${name}!` };
    }

    async getMindfulness(first = 20, after?: string) {
        if (after) {
            return await this.mindfulnessModel.find(
                { _id: { $lt: after } },
                null,
                { sort: '-_id' }
            ).limit(first).exec();
        } else {
            return await this.mindfulnessModel.find({}, null, { sort: '-_id' }).limit(first).exec();
        }
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
        return await this.mindfulnessRecordModel.find(
            conditions,
            null,
            { sort: sort, limit: limit, skip: (page - 1) * limit }).exec()
    }

    async createMindfulness(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        return await this.mindfulnessModel.create(data)
    }

    async updateMindfulness(id, data) {
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
        console.log(updateObject)
        return await this.mindfulnessModel.findOneAndUpdate({ _id: id }, updateObject).exec()
    }

    async deleteMindfulness(id) {
        return await this.mindfulnessModel.findOneAndUpdate({ _id: id }, { $bit: { status: { or: 0b000000000000000000000000000000001 } } }).exec()
    }

    async revertDeletedMindfulness(id) {
        return await this.mindfulnessModel.findOneAndUpdate({ _id: id }, { $bit: { status: { and: 0b001111111111111111111111111111110 } } }).exec()
    }

    async favoriteMindfulness(userId, mindfulnessId) {
        return await this.mindfulnessRecordModel.findOneAndUpdate({
            userId: userId,
            mindfulnessId: mindfulnessId
        }, { $inc: { favorite: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async startMindfulness(userId, mindfulnessId) {
        return await this.mindfulnessRecordModel.findOneAndUpdate({ userId: userId, mindfulnessId: mindfulnessId },
            { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async finishMindfulness(userId, mindfulnessId, duration) {
        let currentRecord = await this.mindfulnessRecordModel.findOne({ userId: userId, mindfulnessId: mindfulnessId });
        let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } }
        if (duration > currentRecord.longestDuration) {
            updateObj.$set['longestDuration'] = duration
        }
        return await this.mindfulnessRecordModel.findOneAndUpdate({ userId: userId, mindfulnessId: mindfulnessId },
            updateObj,
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
    }

    async buyMindfulness(userId, mindfulnessId) {
        // let mindfulness = await this.mindfulnessModel.findOne({ _id: mindfulnessId });
        // // https://juejin.im/post/5ace2f935188255566700f19
        // // 创建新的transaction
        // const transaction = await this.mindfulnessTransactionModel.create({
        //     userId: userId,
        //     mindfulnessId: mindfulnessId,
        //     price: mindfulness.price,
        //     lastModified: moment().unix(),
        //     state: 'initial',
        // });
        // // // 找到transaction
        // // const transaction = await this.mindfulnessTransactionModel.findOne({
        // //     userId: userId,
        // //     mindfulnessId: mindfulnessId,
        // //     state: "initial"
        // // }).exec();
        // try {
        //     // 更新transaction state 为pending
        //     await this.mindfulnessTransactionModel.findOneAndUpdate(
        //         { _id: transaction._id, state: "initial" },
        //         { $set: { state: "pending", lastModified: moment().unix() } }).exec();
        //     // todo 检查changePendingResult 是不是更新了一个
        //     // 更新account和更新record
        //     await this.userModel.findOneAndUpdate(
        //         {
        //             _id: transaction.userId,
        //             balance: { $gte: transaction.price },
        //             pendingTransactions: { $ne: transaction._id }
        //         },
        //         { $inc: { balance: -transaction.price }, $push: { pendingTransactions: transaction._id } }).exec();
        //     await this.mindfulnessRecordModel.findOneAndUpdate({
        //             userId: transaction.userId,
        //             mindfulnessId: transaction.mindfulnessId
        //         },
        //         { $set: { boughtTime: moment().unix() }, $push: { pendingTransactions: transaction._id } },
        //         { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
        //     // 更新transaction的state
        //     await this.mindfulnessTransactionModel.findOneAndUpdate(
        //         { _id: transaction._id, state: 'pending' },
        //         { $set: { state: "applied", lastModified: moment().unix() } }).exec();
        //     // 更新两个pending transactions的account
        //     await this.userModel.findOneAndUpdate(
        //         { _id: transaction.userId, pendingTransactions: transaction._id },
        //         { $pull: { pendingTransactions: transaction._id } }).exec();
        //     const finalResult = await this.mindfulnessRecordModel.findOneAndUpdate(
        //         { userId: transaction.userId, mindfulnessId: transaction.mindfulnessId },
        //         { $pull: { pendingTransactions: transaction._id } },
        //         { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
        //     //更新transaction的state为done
        //     await this.mindfulnessTransactionModel.findOneAndUpdate(
        //         { _id: transaction._id, state: "applied" },
        //         { $set: { state: "done", lastModified: moment().unix() } }).exec();
        //
        //     return finalResult;
        // } catch (e) {
        //     // todo 让错误处理守护程序去处理
        // }

        // todo 以上是二段提交实现，太复杂了，等等mongodb有生之年支持ACID事务
        // 下面是简单的没保证的实现
        // 1.增加一条消费记录
        // 2.检查用户的钱扣钱
        // 3.修改消费记录
        // 4.标记为买了
        // 5.修改消费记录

        // const res = await this.userServiceInterface.changeBalance({id:userId,changeValue:1000}).toPromise();
        // console.log(res);

        // const res = await this.userModel.findOneAndUpdate({ _id: userId }, { $inc: { balance: 10000 } }).exec();
        // console.log(res);
        const oldMindfulness = await this.mindfulnessRecordModel.findOne({ userId: userId, mindfulnessId: mindfulnessId }).exec();
        if (oldMindfulness && oldMindfulness.boughtTime !== 0)
            throw new RpcException({ code: 400, message: t('already bought') });
        const mindfulness = await this.mindfulnessRecordModel.findOneAndUpdate(
            { userId: userId, mindfulnessId: mindfulnessId},
            { $set: { boughtTime: moment().unix() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
        return mindfulness;
    }

    async searchMindfulness(keyword) {
        return await this.mindfulnessModel.find({ $or: [{ name: new RegExp(keyword, 'i') }, { description: new RegExp(keyword, 'i') }] }).exec();
    }
}
