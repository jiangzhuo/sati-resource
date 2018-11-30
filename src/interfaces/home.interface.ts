import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Home extends Document {
    readonly position: number;
    readonly type: string;
    readonly resourceId: ObjectId;
    readonly background: string[];
    readonly name: string;
    readonly description: string;
    readonly author: ObjectId;
    readonly createTime: number;
    readonly updateTime: number;
    readonly validTime:number;
}
