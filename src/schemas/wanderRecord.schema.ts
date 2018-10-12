import * as mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;
export const WanderRecordSchema = new mongoose.Schema({
    userId: ObjectId,
    wanderId: ObjectId,
    favorite: { type: Number, default: 0 }, // 是否收藏 偶数代表已经收藏 奇数代表没有收藏
    totalDuration: { type: Number, default: 0 }, // 累计时长
    longestDuration: { type: Number, default: 0 }, // 最长单词时长
    startCount: { type: Number, default: 0 }, // 总共开始次数
    finishCount: { type: Number, default: 0 }, // 总完成次数
    lastStartTime: { type: Number, default: 0 }, // 上次开始时间
    lastFinishTime: { type: Number, default: 0 }, // 上次结束时间
    boughtTime: { type: Number, default: 0 }, // 购买时间，没有购买的话为0
});
