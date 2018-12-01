import { Service, Context, ServiceBroker } from 'moleculer';
import { Inject, Injectable } from '@nestjs/common';
import { HomeService } from "../services/home.service";
import { InjectBroker } from 'nestjs-moleculer';

@Injectable()
export class HomeController extends Service {
    constructor(@InjectBroker() broker: ServiceBroker,
                @Inject(HomeService) private readonly homeService: HomeService
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "home",
            //version: "v2",
            meta: {
                scalable: true
            },
            // dependencies: [
            // 	"auth",
            // 	"users"
            // ],
            settings: {
                upperCase: true
            },
            actions: {
                sayHello: this.sayHello,
                getNew: this.getNew,
                getHome: this.getHome,
                getHomeById: this.getHomeById,
                createHome: this.createHome,
                updateHome: this.updateHome,
                deleteHome: this.deleteHome,
                // welcome: {
                //     cache: {
                //         keys: ["name"]
                //     },
                //     params: {
                //         name: "string"
                //     },
                //     handler: this.welcome
                // }
            },
            // events: {
            //     "user.created": this.userCreated
            // },
            created: this.serviceCreated,
            started: this.serviceStarted,
            stopped: this.serviceStopped,
        });
    }

    // onModuleInit(){
    //     setTimeout(()=>{
    //         this.broker.call('v2.greeter.welcome', { name: "jiangzhuo" }).then((res) => {
    //             console.log(res)
    //         })
    //     },1000)
    // }

    // // Event handler
    // userCreated(user) {
    //     this.broker.call("mail.send", { user });
    // }

    serviceCreated() {
        this.logger.info("home service created.");
    }

    serviceStarted() {
        this.logger.info("home service started.");
    }

    serviceStopped() {
        this.logger.info("home service stopped.");
    }

    async sayHello(ctx: Context) {
        return this.homeService.sayHello(ctx.params.name);
    }

    async getNew(ctx: Context) {
        return { data: await this.homeService.getNew(ctx.params.first, ctx.params.after, ctx.params.before) };
    }

    async getHome(ctx: Context) {
        return { data: await this.homeService.getHome(ctx.params.first, ctx.params.after, ctx.params.before, ctx.params.position) };
    }

    async getHomeById(ctx: Context) {
        return { data: await this.homeService.getHomeById(ctx.params.id) };
    }

    async createHome(ctx: Context) {
        return { data: await this.homeService.createHome(ctx.params) };
    }

    async updateHome(ctx: Context) {
        return { data: await this.homeService.updateHome(ctx.params.id, ctx.params) };
    }

    async deleteHome(ctx: Context) {
        return { data: await this.homeService.deleteHome(ctx.params.id) };
    }
}
