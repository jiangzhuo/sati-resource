import { Model } from 'mongoose';
import { Mindfulness } from "../interfaces/mindfulness.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class MindfulnessService {
    constructor(
        @InjectModel('Mindfulness') private readonly mindfulnessModel: Model<Mindfulness>
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
}
