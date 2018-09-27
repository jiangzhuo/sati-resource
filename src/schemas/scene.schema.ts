import * as mongoose from 'mongoose';
import { WanderAlbumSchema } from "./wanderAlbum.schema";

const ObjectId = mongoose.Schema.Types.ObjectId;
export const SceneSchema = new mongoose.Schema({
    name: { type: String, unique: true },
}, { autoIndex: true });
