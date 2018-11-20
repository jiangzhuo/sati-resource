import * as mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;
export const MindfulnessTransactionSchema = new mongoose.Schema({
    userId: ObjectId,
    mindfulnessId: ObjectId,
    price: Number,
    beforeBalance: Number,
    afterBalance: Number,
    lastModified: { type: Number, default: 0 },
    state: { type: String, default: 'initial' },
}, { autoIndex: true, toJSON: { virtuals: true } });
