import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Wander extends Document {
    readonly background: string;
    readonly name: string;
    readonly description: string;
    readonly scenes: ObjectId[];
    readonly price: number;
    readonly createTime: number;
    readonly updateTime: number;
    readonly author: ObjectId;
    readonly audio: string;
    readonly copy: string;
    readonly wanderAlbumId: ObjectId;
    readonly status: number;
}
