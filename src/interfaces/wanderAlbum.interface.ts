import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface WanderAlbum extends Document {
    readonly background: string;
    readonly name: string;
    readonly description: string;
    readonly scenes: ObjectId[];
    readonly productId: string;
    readonly createTime: number;
    readonly updateTime: number;
    readonly author: string;
    readonly copy: string;
    readonly status: number;
}
