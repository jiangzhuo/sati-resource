import { Model } from 'mongoose';
import { Nature } from "../interfaces/nature.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

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
        return await this.natureModel.find({ _id: id }).exec()
    }

    async getNatureByIds(ids) {
        return await this.natureModel.find({ _id: { $in: ids } }).exec()
    }
}
