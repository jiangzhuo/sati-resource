import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface User extends Document {
    readonly mobile: string;
    readonly username: string;
    readonly password: string;
    readonly nickname: string;
    readonly avatar: string;
    readonly status: number;
    readonly createTime: number;
    readonly updateTime: number;
    readonly balance: number;
    // readonly pendingTransactions: ObjectId[];
}
