import { Model } from 'mongoose';
import { Wander } from "../interfaces/wander.interface";
import { WanderAlbum } from "../interfaces/wanderAlbum.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WanderService {
    constructor(
        @InjectModel('Wander') private readonly wanderModel: Model<Wander>,
        @InjectModel('WanderAlbum') private readonly wanderAlbumModel: Model<WanderAlbum>
    ) { }

    async sayHello(name: string) {
        return { msg: `Wander Hello ${name}!` };
    }

    async getWander(first = 20, after?: string) {
        if (after) {
            return await this.wanderModel.find({ _id: { $gte: after } }).limit(first).exec();
        } else {
            return await this.wanderModel.find().limit(first).exec();
        }
    }

    async getWanderById(id) {
        return await this.wanderModel.find({ _id: id }).exec();
    }

    async getWanderByIds(ids) {
        return await this.wanderModel.find({ _id: { $in: ids } }).exec();
    }

    async getWanderByWanderAlbumId(id) {
        return await this.wanderModel.find({ wanderAlbumId: id }).exec();
    }

    async getWanderAlbum(first = 20, after?: string) {
        if (after) {
            return await this.wanderAlbumModel.find({ _id: { $gte: after } }).limit(first).exec();
        } else {
            return await this.wanderAlbumModel.find().limit(first).exec();
        }
    }

    async getWanderAlbumById(id) {
        return await this.wanderAlbumModel.find({ _id: id }).exec()
    }

    async getWanderAlbumByIds(ids) {
        return await this.wanderAlbumModel.find({ _id: { $in: ids } }).exec()
    }
}
