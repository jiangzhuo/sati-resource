import * as mongoose from 'mongoose';
import * as Int32 from "mongoose-int32";

const ObjectId = mongoose.Schema.Types.ObjectId;
export const WanderAlbumSchema = new mongoose.Schema({
    background: [String],
    name: String,
    description: String,
    scenes: [ObjectId],
    price: Number,
    createTime: Number,
    updateTime: Number,
    author: ObjectId,
    copy: String,
    status: { type: Int32, default: 0 },
    validTime: Number,
}, { autoIndex: true, toJSON: { virtuals: true } });
