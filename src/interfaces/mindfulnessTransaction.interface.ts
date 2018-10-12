import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface MindfulnessTransaction extends Document {
    readonly userId: ObjectId;
    readonly mindfulnessId: ObjectId;
    readonly price: number;
    readonly beforeBalance: number;
    readonly afterBalance: number;
    readonly lastModified: number;
    readonly state: string;
}
