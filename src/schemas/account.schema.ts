import * as mongoose from 'mongoose';
mongoose.set('debug',true)

const ObjectId = mongoose.Schema.Types.ObjectId;
export const AccountSchema = new mongoose.Schema({
    userId: ObjectId,
    value: Number,
    afterBalance: Number,
    type: String,
    createTime: Number,
    extraInfo: { type: String, default: '' },
}, { autoIndex: true, toJSON: { virtuals: true } });
