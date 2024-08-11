import { IsString } from "class-validator";


export class change_topic_Dto{
    @IsString()
    subject:string; //로드맵 주제

    @IsString()
    topic:string;  //제목
}

export class change_concept_Dto{
    @IsString()
    subject:string; //로드맵 주제

    @IsString()
    topic:string;  //제목

    @IsString()
    concept:string; //그안 개념들
}