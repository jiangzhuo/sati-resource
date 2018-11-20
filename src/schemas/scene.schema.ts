import * as mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;
export const SceneSchema = new mongoose.Schema({
    name: { type: String, unique: true },
}, { autoIndex: true, toJSON: { virtuals: true } });
