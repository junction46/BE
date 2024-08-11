import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { CommonService } from './common.service';
import { gen_roadmap_DTO } from './Dto/roadmap.dto';
import { JwtAuthGuard } from 'src/auth/Guard/jwt.guard';
import { Payload } from 'src/auth/jwt.payload';
import { change_concept_Dto, change_topic_Dto } from './Dto/passchange.dto';

@Controller('common')
@UseGuards(JwtAuthGuard)
export class CommonController {
    constructor(
        private readonly CommonService : CommonService
    ){}

    @Post('/gpt')
    async gen_roadmap_content(@Body(ValidationPipe) RoadmapDto: gen_roadmap_DTO, @Req() req):Promise<void>{
        const user : Payload = req.user
        const subject : string = RoadmapDto.subject
        await this.CommonService.generateText(subject, user)
    }

    @Get('/subject')
    async get_topic_list(@Req() req){
        const user = req.user
        return await this.CommonService.getRecentSubjects(user)
    }

    @Post('/content')
    async get_content_from_topic(@Body(ValidationPipe) RoadmapDto: gen_roadmap_DTO, @Req() req){
        const user:Payload = req.user
        const subject:string = RoadmapDto.subject
        return await this.CommonService.getRoadmapContent(user, subject)
    }

    @Post('/pass/topic')
    async change_pass_topic(@Body(ValidationPipe) topic_dto:change_topic_Dto, @Req() req):Promise<void>{
        const {subject, topic} = topic_dto;
        await this.CommonService.updateTopicPassStatus(req.user.googleId, subject, topic);
    }

    @Post('/pass/concept')
    async change_pass_concept(@Body(ValidationPipe) concept_dto:change_concept_Dto, @Req() req):Promise<void>{
        const {subject, topic, concept} = concept_dto;
        await this.CommonService.updateconceptPassStatus(req.user.googleId, subject, topic, concept);
    }

}
