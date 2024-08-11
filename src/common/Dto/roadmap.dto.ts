import { IsString } from "@nestjs/class-validator";

export class gen_roadmap_DTO{
    @IsString()
    subject:string  //로드맵 주제
}