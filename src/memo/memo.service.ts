import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Memo } from './entity/memo.entity'; // Entity 경로 확인
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { MemoRepository } from './repository/memo.repository';

@Injectable()
export class MemoService {
    private readonly apiKey = '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';
    
    constructor(
        @InjectRepository(MemoRepository)
        private readonly memoRepository:MemoRepository ,
        private readonly httpService: HttpService,
    ){}

    async gen_feedback(subject: string,topic: string, concept:string, memo: string, googleId:string) {
        try {
            const response: AxiosResponse<any> = await lastValueFrom(
              this.httpService.post(
                'https://api.openai.com/v1/chat/completions',
                {
                  model: 'gpt-4o',
                  messages: [
                    {
                      role: 'system',
                      content: 
                      `
                      The following note is about "${concept}" : '${memo}'. Find the errors, flaws or points to improve and structurize the result to JSON. The format of JSON have to contain the location of error which is the index of the note, error message and the suggestion. You can add comment data for the missing information of the topic, including index. You must send me only the json data.
                    The JSON structure should be as follows:
                    json

                        {
                        "understanding": Understanding percent how much this note understands about the topic
                        "errors": [
                            {
                            "index": error characters location,
                            "error_message": error_message,
                            "suggestion”:suggestion about error
                            },
                            ….
                            ],
                        "comments": [
                        {
                        "index": comment_location,
                        "comment”: comment about topic
                        },
                        ....
                        ]
                    `  
                    }
                  ],
                  max_tokens: 4096,
                  temperature: 0.3,
                },
                {
                  headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                  },
                },
              ).pipe(
                catchError((error) => {
                  console.error('Error generating text:', error);
                  throw new HttpException(
                    'Failed to generate text',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }),
              ),
            );
        
            let content = response.data.choices[0].message.content;
            this.save_memo(subject, topic, concept, memo, googleId);
            if (content.trim().charAt(0) !== '{') {
              let lines = content.trim().split('\n');
      
              // 첫 줄과 마지막 줄 제거
              lines = lines.slice(1, -1);
      
              // 다시 합치기
              content = lines.join('\n');
          }
            return content;  // 응답 내용을 반환
        } catch (error) {
            console.error(error);
            throw new HttpException(
                'Failed to generate feedback',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    

    async save_memo(subject: string, topic: string, concept:string, memo:string,  googleId: string): Promise<Memo> {
      return await this.memoRepository.saveMemo(subject, topic, concept, memo, googleId);
    }

    async get_memo(subject:string, topic:string, concept:string, googleId:string):Promise<string>{
      const foundMemo = await this.memoRepository.findMemo(subject, topic, concept, googleId);
      return foundMemo ? foundMemo.memo : null;
    }

}
