import { IsString } from "@nestjs/class-validator";

export class memo_dto{
    @IsString()
    subject:string;

    @IsString()
    topic: string;

    @IsString()
    concept:string

    @IsString()
    memo:string;
}

export class memo_get_dto{
    @IsString()
    subject:string;
    
    @IsString()
    topic:string;

    @IsString()
    concept:string;
}