import { Model } from 'mongoose';
import { Home } from "../interfaces/home.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty, isNumber, isArray } from 'lodash';
import { ObjectId } from 'mongodb';
import * as moment from "moment";

@Injectable()
export class HomeService {
    constructor(
        @InjectModel('Home') private readonly homeModel: Model<Home>,
    ) { }

    async sayHello(name: string) {
        return { msg: `Home Hello ${name}!` };
    }

    async getHome(first = 20, after?: number, position?: number) {
        let query = {};
        if (after) {
            query['validTime'] = { $gt: after }
        }
        if (isNumber(position)) {
            query['position'] = position
        }
        let sortArg;
        if (first > 0) {
            sortArg = { validTime: 1 }
        } else {
            sortArg = { validTime: -1 }
        }
        return await this.homeModel.find(query).sort(sortArg).limit(first).exec();
    }

    async getHomeById(id) {
        return await this.homeModel.findOne({ _id: id }).exec()
    }

    async createHome(data) {
        data.createTime = moment().unix();
        data.updateTime = moment().unix();
        return await this.homeModel.create(data)
    }

    async updateHome(id, data) {
        let updateObject = { updateTime: moment().unix() };
        if (!isEmpty(data.position)) {
            updateObject['position'] = data.position;
        }
        if (!isEmpty(data.type)) {
            updateObject['type'] = data.type;
        }
        if (!isEmpty(data.resourceId)) {
            updateObject['resourceId'] = data.resourceId;
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
        if (!isEmpty(data.author)) {
            updateObject['author'] = data.author;
        }
        if (isNumber(data.position)) {
            updateObject['position'] = data.position;
        }
        return await this.homeModel.findOneAndUpdate({ _id: id }, updateObject).exec()
    }

    async deleteHome(id) {
        return await this.homeModel.findOneAndRemove({ _id: id }).exec();
    }
}
