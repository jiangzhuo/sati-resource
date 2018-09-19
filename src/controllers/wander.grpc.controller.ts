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
}
