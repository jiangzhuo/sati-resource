import { Model } from 'mongoose';
import { Scene } from "../interfaces/scene.interface";
import { Mindfulness } from "../interfaces/mindfulness.interface";
import { Nature } from "../interfaces/nature.interface";
import { Wander } from "../interfaces/wander.interface";
import { WanderAlbum } from "../interfaces/wanderAlbum.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class SceneService {
    constructor(
        @InjectModel('Scene') private readonly sceneModel: Model<Scene>,
        @InjectModel('Mindfulness') private readonly mindfulnessModel: Model<Mindfulness>,
        @InjectModel('Nature') private readonly natureModel: Model<Nature>,
        @InjectModel('Wander') private readonly wanderModel: Model<Wander>,
        @InjectModel('WanderAlbum') private readonly wanderAlbumModel: Model<WanderAlbum>,
    ) { }

    async sayHello(name: string) {
        return { msg: `Scene Hello ${name}!` };
    }

    async createScene(name) {
        return await this.sceneModel.create({ name: name })
    }

    async updateScene(id, name) {
        return await this.sceneModel.findOneAndUpdate({ _id: id }, { name: name }).exec()
    }

    async deleteScene(id) {
        await this.mindfulnessModel.updateMany({}, { $pull: { scenes: id } }).exec();
        await this.natureModel.updateMany({}, { $pull: { scenes: id } }).exec();
        await this.wanderModel.updateMany({}, { $pull: { scenes: id } }).exec();
        await this.wanderAlbumModel.updateMany({}, { $pull: { scenes: id } }).exec();
        return await this.sceneModel.findOneAndRemove({ _id: id }).exec()
    }

    async getScene(first = 20, after?: string) {
        if (after) {
            return await this.sceneModel.find({ _id: { $gte: after } }).limit(first).exec();
        } else {
            return await this.sceneModel.find().limit(first).exec();
        }
    }

    async getSceneById(id) {
        return await this.sceneModel.findOne({ _id: id }).exec()
    }

    async getSceneByIds(ids) {
        return await this.sceneModel.find({ _id: { $in: ids } }).exec()
    }
}
