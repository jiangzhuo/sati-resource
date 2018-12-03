import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface MindfulnessAlbumRecord extends Document {
    readonly userId: ObjectId;
    readonly mindfulnessAlbumId: ObjectId;
    readonly favorite: number; // 是否收藏 偶数代表已经收藏 奇数代表没有收藏
    readonly totalDuration: number; // 累计时长
    readonly longestDuration: number; // 最长单词时长
    readonly startCount: number; // 总共开始次数
    readonly finishCount: number; // 总完成次数
    readonly lastStartTime: number; // 上次开始时间
    readonly lastFinishTime: number; // 上次结束时间
    readonly boughtTime: number; // 购买的时间
}
