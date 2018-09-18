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
}
