import * as mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;
export const SceneSchema = new mongoose.Schema({
    name: String,
});
