import { Model } from 'mongoose';
import { Mindfulness } from "../interfaces/mindfulness.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import * as moment from 'moment';
import { isEmpty, isNumber } from 'lodash';

@Injectable()
export class MindfulnessService {
    constructor(
        @InjectModel('Mindfulness') private readonly mindfulnessModel: Model<Mindfulness>
    ) { }

    async sayHello(name: string) {
        return { msg: `Mindfulness Hello ${name}!` };
    }

    async getMindfulness(first = 20, after?: string) {
        console.log(111111)
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

    async createMindfulness(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        return await this.mindfulnessModel.create(data)
    }

    async updateMindfulness(id, data) {
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
        return await this.mindfulnessModel.findOneAndRemove({ _id: id }).exec()
    }
}
