import * as  mongoose from 'mongoose';
import * as Int32 from "mongoose-int32";

const ObjectId = mongoose.Schema.Types.ObjectId;
export const NatureSchema = new mongoose.Schema({
    background: [String],
    name: String,
    description: String,
    scenes: [ObjectId],
    price: Number,
    createTime: Number,
    updateTime: Number,
    author: ObjectId,
    audio: String,
    copy: String,
    status: { type: Int32, default: 0 },
}, { autoIndex: true, toJSON: { virtuals: true } });
