import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { __ as t } from 'i18n';

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
}
