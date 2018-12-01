import { Model } from 'mongoose';
import { Home } from "../interfaces/home.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isArray, isEmpty, isNumber } from 'lodash';
import * as moment from "moment";
import { Mindfulness } from 'src/interfaces/mindfulness.interface';
import { Nature } from 'src/interfaces/nature.interface';
import { Wander } from 'src/interfaces/wander.interface';
import { WanderAlbum } from "../interfaces/wanderAlbum.interface";

@Injectable()
export class HomeService {
    constructor(
        @InjectModel('Home') private readonly homeModel: Model<Home>,
        @InjectModel('Mindfulness') private readonly mindfulnessModel: Model<Mindfulness>,
        @InjectModel('Nature') private readonly natureModel: Model<Nature>,
        @InjectModel('Wander') private readonly wanderModel: Model<Wander>,
        @InjectModel('WanderAlbum') private readonly wanderAlbumModel: Model<WanderAlbum>,
    ) {
    }

    async sayHello(name: string) {
        return { msg: `Home Hello ${ name }!` };
    }

    async getNew(first = 20, after?: number, before?: number) {
        let query = {};
        if (after) {
            query['validTime'] = { $gt: after }
        }
        if (before) {
            if (query['validTime']) {
                query['validTime']['$lt'] = before
            } else {
                query['validTime'] = { $lt: before }
            }
        }
        let sortArg;
        if (first > 0) {
            sortArg = { validTime: 1 }
        } else {
            sortArg = { validTime: -1 }
        }
        let result = [];
        const mindfulnessResult = await this.mindfulnessModel.find(query).sort(sortArg).limit(Math.abs(first)).exec();
        const natureResult = await this.natureModel.find(query).sort(sortArg).limit(Math.abs(first)).exec();
        const wanderResult = await this.wanderModel.find(query).sort(sortArg).limit(Math.abs(first)).exec();
        const wanderAlbumResult = await this.wanderAlbumModel.find(query).sort(sortArg).limit(Math.abs(first)).exec();
        mindfulnessResult.forEach((mindfulness) => {
            result.push({
                type: 'mindfulness',
                resourceId: mindfulness.id,
                background: mindfulness.background,
                name: mindfulness.name,
                description: mindfulness.description,
                price: mindfulness.price,
                author: mindfulness.author,
                createTime: mindfulness.createTime,
                updateTime: mindfulness.updateTime,
                validTime: mindfulness.validTime
            })
        });
        natureResult.forEach((nature) => {
            result.push({
                type: 'nature',
                resourceId: nature.id,
                background: nature.background,
                name: nature.name,
                description: nature.description,
                price: nature.price,
                author: nature.author,
                createTime: nature.createTime,
                updateTime: nature.updateTime,
                validTime: nature.validTime
            })
        });
        wanderResult.forEach((wander) => {
            result.push({
                type: 'wander',
                resourceId: wander.id,
                background: wander.background,
                name: wander.name,
                description: wander.description,
                price: wander.price,
                author: wander.author,
                createTime: wander.createTime,
                updateTime: wander.updateTime,
                validTime: wander.validTime
            })
        });
        wanderAlbumResult.forEach((wanderAlbum) => {
            result.push({
                type: 'wanderAlbum',
                resourceId: wanderAlbum.id,
                background: wanderAlbum.background,
                name: wanderAlbum.name,
                description: wanderAlbum.description,
                price: wanderAlbum.price,
                author: wanderAlbum.author,
                createTime: wanderAlbum.createTime,
                updateTime: wanderAlbum.updateTime,
                validTime: wanderAlbum.validTime
            })
        });
        if (first > 0) {
            result.sort((a, b) => {
                return a.validTime - b.validTime;
            })
        } else {
            result.sort((a, b) => {
                return b.validTime - a.validTime;
            })
        }
        return result.slice(0, Math.abs(first));
    }

    async getHome(first = 20, after?: number, before?: number, position?: number) {
        let query = {};
        if (after) {
            query['validTime'] = { $gt: after }
        }
        if (before) {
            if (query['validTime']) {
                query['validTime']['$lt'] = before
            } else {
                query['validTime'] = { $lt: before }
            }
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
        return await this.homeModel.find(query).sort(sortArg).limit(Math.abs(first)).exec();
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
        if (isArray(data.background)) {
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
        if (isNumber(data.validTime)) {
            updateObject['validTime'] = data.validTime;
        }
        return await this.homeModel.findOneAndUpdate({ _id: id }, updateObject).exec()
    }

    async deleteHome(id) {
        return await this.homeModel.findOneAndRemove({ _id: id }).exec();
    }
}
