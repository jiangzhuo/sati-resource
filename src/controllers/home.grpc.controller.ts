import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { HomeService } from '../services/home.service';
// import { LoggingInterceptor } from "../interceptors/logging.interceptor";
// import { ErrorsInterceptor } from "../interceptors/exception.interceptor";

@Controller()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class HomeGrpcController {
    constructor(
        @Inject(HomeService) private readonly homeService: HomeService
    ) { }

    @GrpcMethod('HomeService')
    async sayHello(data: { name: string }) {
        return this.homeService.sayHello(data.name);
    }

    @GrpcMethod('HomeService')
    async getHome(data: { first: number, after: string }) {
        return { data: await this.homeService.getHome(data.first, data.after) };
    }

    @GrpcMethod('HomeService')
    async getHomeById(data: { id: string }) {
        return { data: await this.homeService.getHomeById(data.id) };
    }

    @GrpcMethod('HomeService')
    async createHome(data) {
        return { data: await this.homeService.createHome(data) };
    }

    @GrpcMethod('HomeService')
    async updateHome(data) {
        return { data: await this.homeService.updateHome(data.id, data) };
    }

    @GrpcMethod('HomeService')
    async deleteHome(data) {
        return { data: await this.homeService.deleteHome(data.id) };
    }

}
