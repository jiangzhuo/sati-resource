import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Scene extends Document {
    readonly name: string;
}
