import { Model } from 'mongoose';
import { Mindfulness } from "../interfaces/mindfulness.interface";
import { MindfulnessRecord } from "../interfaces/mindfulnessRecord.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import * as moment from 'moment';
import { isEmpty, isNumber, isArray } from 'lodash';

@Injectable()
export class MindfulnessService {
    constructor(
        @InjectModel('Mindfulness') private readonly mindfulnessModel: Model<Mindfulness>,
        @InjectModel('MindfulnessRecord') private readonly mindfulnessRecordModel: Model<MindfulnessRecord>
    ) { }

    async sayHello(name: string) {
        return { msg: `Mindfulness Hello ${name}!` };
    }

    async getMindfulness(first = 20, after?: string) {
        if (after) {
            return await this.mindfulnessModel.find({ _id: { $gte: after } }).limit(first).exec();
        } else {
            return await this.mindfulnessModel.find().limit(first).exec();
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
        return await this.mindfulnessModel.findOneAndUpdate({ _id: id }, { $bit: { status: { or : 0b000000000000000000000000000000001 } } }).exec()
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
}
