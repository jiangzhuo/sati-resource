import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Discount extends Document {
    readonly type: string;
    readonly resourceId: ObjectId;
    readonly background: string[];
    readonly name: string;
    readonly discount: number;
    readonly createTime: number;
    readonly updateTime: number;
    readonly beginTime: number;
    readonly endTime: number;
}
