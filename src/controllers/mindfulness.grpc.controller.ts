import { Controller, Inject, OnModuleInit, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { MindfulnessService } from '../services/mindfulness.service';
// import { LoggingInterceptor } from "../interceptors/logging.interceptor";
// import { ErrorsInterceptor } from "../interceptors/exception.interceptor";

@Controller()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class MindfulnessGrpcController {
    constructor(
        @Inject(MindfulnessService) private readonly mindfulnessService: MindfulnessService
    ) { }

    @GrpcMethod('MindfulnessService')
    async sayHello(data: { name: string }) {
        return this.mindfulnessService.sayHello(data.name);
    }

    @GrpcMethod('MindfulnessService')
    async getMindfulness(data: { first: number, after: string }) {
        return { data: await this.mindfulnessService.getMindfulness(data.first, data.after) };
    }

    @GrpcMethod('MindfulnessService')
    async getMindfulnessById(data: { id: string }) {
        return { data: await this.mindfulnessService.getMindfulnessById(data.id) };
    }

    @GrpcMethod('MindfulnessService')
    async getMindfulnessByIds(data: { ids: string }) {
        return { data: await this.mindfulnessService.getMindfulnessByIds(data.ids) };
    }

    @GrpcMethod('MindfulnessService')
    async createMindfulness(data) {
        return { data: await this.mindfulnessService.createMindfulness(data) };
    }

    @GrpcMethod('MindfulnessService')
    async updateMindfulness(data) {
        return { data: await this.mindfulnessService.updateMindfulness(data.id, data) };
    }

    @GrpcMethod('MindfulnessService')
    async deleteMindfulness(data) {
        return { data: await this.mindfulnessService.deleteMindfulness(data.id) };
    }

    @GrpcMethod('MindfulnessService')
    async revertDeletedMindfulness(data) {
        return { data: await this.mindfulnessService.revertDeletedMindfulness(data.id) };
    }

    @GrpcMethod('MindfulnessService')
    async favoriteMindfulness(data) {
        return { data: await this.mindfulnessService.favoriteMindfulness(data.userId, data.mindfulnessId) };
    }

    @GrpcMethod('MindfulnessService')
    async startMindfulness(data) {
        return { data: await this.mindfulnessService.startMindfulness(data.userId, data.mindfulnessId) };
    }

    @GrpcMethod('MindfulnessService')
    async finishMindfulness(data) {
        return { data: await this.mindfulnessService.finishMindfulness(data.userId, data.mindfulnessId, data.duration) };
    }

    @GrpcMethod('MindfulnessService')
    async getMindfulnessRecordByMindfulnessId(data) {
        return { data: await this.mindfulnessService.getMindfulnessRecord(data.userId, data.mindfulnessId) };
    }

    @GrpcMethod('MindfulnessService')
    async getMindfulnessRecordByMindfulnessIds(data) {
        return { data: await this.mindfulnessService.getMindfulnessRecord(data.userId, data.mindfulnessIds) };
    }

    @GrpcMethod('MindfulnessService')
    async buyMindfulness(data) {
        return { data: await this.mindfulnessService.buyMindfulness(data.userId, data.mindfulnessId) };
    }

    @GrpcMethod('MindfulnessService')
    async searchMindfulness(data) {
        return { data: await this.mindfulnessService.searchMindfulness(data.keyword) };
    }
}
