import * as mongoose from 'mongoose';
import { WanderAlbumSchema } from "./wanderAlbum.schema";

const ObjectId = mongoose.Schema.Types.ObjectId;
export const HomeSchema = new mongoose.Schema({
    position: Number,
    type: String,
    resourceId: ObjectId,
    background: String,
    name: String,
    description: String,
    author: ObjectId,
    createTime: Number,
    updateTime: Number,
}, { autoIndex: true });
