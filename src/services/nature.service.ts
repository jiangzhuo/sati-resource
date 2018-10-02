import { Model } from 'mongoose';
import { Nature } from "../interfaces/nature.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from "moment";
import { isEmpty, isNumber, isArray } from 'lodash';

@Injectable()
export class NatureService {
    constructor(
        @InjectModel('Nature') private readonly natureModel: Model<Nature>
    ) { }

    async sayHello(name: string) {
        return { msg: `Mindfulness Hello ${name}!` };
    }

    async getNature(first = 20, after?: string) {
        if (after) {
            return await this.natureModel.find({ _id: { $gte: after } }).limit(first).exec();
        } else {
            return await this.natureModel.find().limit(first).exec();
        }
    }

    async getNatureById(id) {
        return await this.natureModel.findOne({ _id: id }).exec()
    }

    async getNatureByIds(ids) {
        return await this.natureModel.find({ _id: { $in: ids } }).exec()
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
        return await this.natureModel.findOneAndUpdate({ _id: id }, updateObject).exec()
    }

    async deleteNature(id) {
        return await this.natureModel.findOneAndRemove({ _id: id }).exec()
    }
}
