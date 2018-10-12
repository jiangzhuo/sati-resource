import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { NatureService } from '../services/nature.service';
// import { LoggingInterceptor } from "../interceptors/logging.interceptor";
// import { ErrorsInterceptor } from "../interceptors/exception.interceptor";

@Controller()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class NatureGrpcController {
    constructor(
        @Inject(NatureService) private readonly natureService: NatureService
    ) { }

    @GrpcMethod('NatureService')
    async sayHello(data: { name: string }) {
        return this.natureService.sayHello(data.name);
    }

    @GrpcMethod('NatureService')
    async getNature(data: { first: number, after: string }) {
        return { data: await this.natureService.getNature(data.first, data.after) };
    }

    @GrpcMethod('NatureService')
    async getNatureById(data: { id: string }) {
        return { data: await this.natureService.getNatureById(data.id) };
    }

    @GrpcMethod('NatureService')
    async getNatureByIds(data: { ids: string }) {
        return { data: await this.natureService.getNatureByIds(data.ids) };
    }

    @GrpcMethod('NatureService')
    async createNature(data) {
        return { data: await this.natureService.createNature(data) };
    }

    @GrpcMethod('NatureService')
    async updateNature(data) {
        return { data: await this.natureService.updateNature(data.id, data) };
    }

    @GrpcMethod('NatureService')
    async deleteNature(data) {
        return { data: await this.natureService.deleteNature(data.id) };
    }

    @GrpcMethod('NatureService')
    async revertDeletedNature(data) {
        return { data: await this.natureService.revertDeletedNature(data.id) };
    }

    @GrpcMethod('NatureService')
    async favoriteNature(data) {
        return { data: await this.natureService.favoriteNature(data.userId, data.natureId) };
    }

    @GrpcMethod('NatureService')
    async startNature(data) {
        return { data: await this.natureService.startNature(data.userId, data.natureId) };
    }

    @GrpcMethod('NatureService')
    async finishNature(data) {
        return { data: await this.natureService.finishNature(data.userId, data.natureId, data.duration) };
    }

    @GrpcMethod('NatureService')
    async GetNatureRecordByNatureId(data) {
        return { data: await this.natureService.getNatureRecord(data.userId, data.natureId) };
    }

    @GrpcMethod('NatureService')
    async GetNatureRecordByNatureIds(data) {
        return { data: await this.natureService.getNatureRecord(data.userId, data.natureIds) };
    }

    @GrpcMethod('NatureService')
    async buyNature(data) {
        return { data: await this.natureService.buyNature(data.userId, data.natureId) };
    }
}
