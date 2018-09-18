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
}
