import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface WanderAlbum extends Document {
    readonly background: string[];
    readonly name: string;
    readonly description: string;
    readonly scenes: ObjectId[];
    readonly price: number;
    readonly createTime: number;
    readonly updateTime: number;
    readonly author: ObjectId;
    readonly copy: string;
    readonly status: number;
    readonly validTime: number; // 生效时间
}
