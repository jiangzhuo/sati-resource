import { Model } from 'mongoose';
import { Mindfulness } from "../interfaces/mindfulness.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MindfulnessService {
    constructor(
        @InjectModel('Mindfulness') private readonly mindfulnessModel: Model<Mindfulness>
    ) { }

    async sayHello(name: string) {
        return { msg: `Mindfulness Hello ${name}!` };
    }

    async getMindfulness(first = 20, after?: string) {
        // if (after) {
        //     return await this.mindfulnessRepo.find({ where: { id: { $gte: new ObjectID(after) } }, take: first });
        // } else {
        //     return await this.mindfulnessRepo.find({ take: first });
        // }
        return await this.mindfulnessModel.find().exec();
    }

    async getMindfulnessById(id: string) {
        return await this.mindfulnessModel.findOne().exec();
    }
}
