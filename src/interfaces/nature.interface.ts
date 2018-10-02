import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Nature extends Document {
    readonly background: string;
    readonly name: string;
    readonly description: string;
    readonly scenes: ObjectId[];
    readonly price: number;
    readonly createTime: number;
    readonly updateTime: number;
    readonly author: string;
    readonly audio: string;
    readonly status: number;
}