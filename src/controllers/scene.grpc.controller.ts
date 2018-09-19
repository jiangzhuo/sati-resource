import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { SceneService } from '../services/scene.service';
// import { LoggingInterceptor } from "../interceptors/logging.interceptor";
// import { ErrorsInterceptor } from "../interceptors/exception.interceptor";

@Controller()
// @UseInterceptors(LoggingInterceptor, ErrorsInterceptor)
export class SceneGrpcController {
    constructor(
        @Inject(SceneService) private readonly sceneService: SceneService
    ) { }

    @GrpcMethod('SceneService')
    async sayHello(data: { name: string }) {
        return this.sceneService.sayHello(data.name);
    }

    @GrpcMethod('SceneService')
    async createScene(data: { name: string }) {
        return { data: await this.sceneService.createScene(data.name) };
    }

    @GrpcMethod('SceneService')
    async updateScene(data: { id: string, name: string }) {
        return { data: await this.sceneService.updateScene(data.id, data.name) };
    }

    @GrpcMethod('SceneService')
    async deleteScene(data: { id: string }) {
        return { data: await this.sceneService.deleteScene(data.id) };
    }

    @GrpcMethod('SceneService')
    async getScene(data: { first: number, after: string }) {
        return { data: await this.sceneService.getScene(data.first, data.after) };
    }

    @GrpcMethod('SceneService')
    async getSceneById(data: { id: string }) {
        return { data: await this.sceneService.getSceneById(data.id) };
    }

    @GrpcMethod('SceneService')
    async getSceneByIds(data: { ids: string }) {
        return { data: await this.sceneService.getSceneByIds(data.ids) };
    }
}
