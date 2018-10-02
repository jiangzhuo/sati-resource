import * as mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;
export const WanderAlbumSchema = new mongoose.Schema({
    background: String,
    name: String,
    description: String,
    scenes: [ObjectId],
    price: Number,
    createTime: Number,
    updateTime: Number,
    author: String,
    copy: String,
    status: Number,
});