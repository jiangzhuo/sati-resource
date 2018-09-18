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
}
