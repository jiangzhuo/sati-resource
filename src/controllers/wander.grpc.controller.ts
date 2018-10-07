import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { WanderService } from '../services/wander.service';
// import { LoggingInterceptor } from "../interceptors/logging.interceptor";
// import { ErrorsInterceptor } from "../interceptors/exception.interceptor";

@Controller()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class WanderGrpcController {
    constructor(
        @Inject(WanderService) private readonly wanderService: WanderService
    ) { }

    @GrpcMethod('WanderService')
    async sayHello(data: { name: string }) {
        return this.wanderService.sayHello(data.name);
    }

    @GrpcMethod('WanderService')
    async getWander(data: { first: number, after: string }) {
        return { data: await this.wanderService.getWander(data.first, data.after) };
    }

    @GrpcMethod('WanderService')
    async getWanderById(data: { id: string }) {
        return { data: await this.wanderService.getWanderById(data.id) };
    }

    @GrpcMethod('WanderService')
    async getWanderByIds(data: { ids: string }) {
        return { data: await this.wanderService.getWanderByIds(data.ids) };
    }

    @GrpcMethod('WanderService')
    async createWander(data) {
        return { data: await this.wanderService.createWander(data) };
    }

    @GrpcMethod('WanderService')
    async updateWander(data) {
        return { data: await this.wanderService.updateWander(data.id, data) };
    }

    @GrpcMethod('WanderService')
    async deleteWander(data) {
        return { data: await this.wanderService.deleteWander(data.id) };
    }

    @GrpcMethod('WanderService')
    async revertDeletedWander(data) {
        return { data: await this.wanderService.revertDeletedWander(data.id) };
    }

    @GrpcMethod('WanderService')
    async favoriteWander(data) {
        return { data: await this.wanderService.favoriteWander(data.userId, data.wanderId) };
    }

    @GrpcMethod('WanderService')
    async startWander(data) {
        return { data: await this.wanderService.startWander(data.userId, data.wanderId) };
    }

    @GrpcMethod('WanderService')
    async finishWander(data) {
        return { data: await this.wanderService.finishWander(data.userId, data.wanderId, data.duration) };
    }

    @GrpcMethod('WanderService')
    async GetWanderRecordByWanderId(data) {
        return { data: await this.wanderService.getWanderRecord(data.userId, data.wanderId) };
    }

    @GrpcMethod('WanderService')
    async GetWanderRecordByWanderIds(data) {
        return { data: await this.wanderService.getWanderRecord(data.userId, data.wanderIds) };
    }

    @GrpcMethod('WanderService')
    async getWanderByWanderAlbumId(data: { id: string }) {
        return { data: await this.wanderService.getWanderByWanderAlbumId(data.id) };
    }

    @GrpcMethod('WanderService')
    async getWanderAlbum(data: { first: number, after: string }) {
        return { data: await this.wanderService.getWanderAlbum(data.first, data.after) };
    }

    @GrpcMethod('WanderService')
    async getWanderAlbumById(data: { id: string }) {
        return { data: await this.wanderService.getWanderAlbumById(data.id) };
    }

    @GrpcMethod('WanderService')
    async getWanderAlbumByIds(data: { ids: string }) {
        return { data: await this.wanderService.getWanderAlbumByIds(data.ids) };
    }

    @GrpcMethod('WanderService')
    async createWanderAlbum(data) {
        return { data: await this.wanderService.createWanderAlbum(data) };
    }

    @GrpcMethod('WanderService')
    async updateWanderAlbum(data) {
        return { data: await this.wanderService.updateWanderAlbum(data.id, data) };
    }

    @GrpcMethod('WanderService')
    async deleteWanderAlbum(data) {
        return { data: await this.wanderService.deleteWanderAlbum(data.id) };
    }

    @GrpcMethod('WanderService')
    async revertDeletedWanderAlbum(data) {
        return { data: await this.wanderService.revertDeletedWanderAlbum(data.id) };
    }

    @GrpcMethod('WanderService')
    async favoriteWanderAlbum(data) {
        console.log(data)
        return { data: await this.wanderService.favoriteWanderAlbum(data.userId, data.wanderAlbumId) };
    }

    @GrpcMethod('WanderService')
    async startWanderAlbum(data) {
        return { data: await this.wanderService.startWanderAlbum(data.userId, data.wanderAlbumId) };
    }

    @GrpcMethod('WanderService')
    async finishWanderAlbum(data) {
        return { data: await this.wanderService.finishWanderAlbum(data.userId, data.wanderAlbumId, data.duration) };
    }

    @GrpcMethod('WanderService')
    async GetWanderAlbumRecordByWanderAlbumId(data) {
        return { data: await this.wanderService.getWanderAlbumRecord(data.userId, data.wanderAlbumId) };
    }

    @GrpcMethod('WanderService')
    async GetWanderAlbumRecordByWanderAlbumIds(data) {
        return { data: await this.wanderService.getWanderAlbumRecord(data.userId, data.wanderAlbumIds) };
    }
}
