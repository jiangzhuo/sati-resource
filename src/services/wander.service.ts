import { Model } from 'mongoose';
import { Wander } from "../interfaces/wander.interface";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WanderService {
    constructor(
        @InjectModel('Wander') private readonly natureModel: Model<Wander>
    ) { }

    async sayHello(name: string) {
        return { msg: `Mindfulness Hello ${name}!` };
    }
}
