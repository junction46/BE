import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { catchError, lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Payload } from 'src/auth/jwt.payload';
import { RoadmapRepository } from './repository/common.repository';


@Injectable()
export class CommonService {
  private readonly apiKey = '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'
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(RoadmapRepository)
    private readonly roadmapRepository: RoadmapRepository,
  ) {}

  async generateText(subject: string, user: Payload): Promise<void> {
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
                `Please provide a comprehensive roadmap in JSON format for the topic of ${subject}. The roadmap should include the following sections:
              1. Topic: Major areas or stages related to ${subject}.
              2. Description: A brief explanation of each topic.
              3. Learning Goals: Goals to achieve in each topic.
              4. Recommended Resources: Recommended learning materials and links related to each topic.
              5. Latest Trends or Technologies: The latest technologies and trends related to each topic.
              6. Practical Projects: Ideas for practical projects related to each topic.
              The JSON structure should be as follows:
              json
              {
              "roadmap": [
                  {
                  "title": "Topic Title",
                  "description": "A brief explanation of the topic.",
                  "pass": false,
                  "topics": [
                      {
                      "title": "Subtopic Title",
                      "description": "A brief explanation of the subtopic.",
                      "pass": false,
                      "learning_goals": [
                          "Learning Goal 1",
                          "Learning Goal 2"
                      ],
                      "recommendations": [
                          "Recommended Resource 1 Link",
                          "Recommended Resource 2 Link"
                      ],
                      "latest_trends": [
                          "Latest Technology 1",
                          "Latest Technology 2"
                      ],
                      "projects": [
                          "Practical Project 1",
                          "Practical Project 2"
                      ]
                      }
                  ]
                  }
              ]
              }
              Please provide information for around 10 topics in a structured manner in detail, so that beginners can use the roadmap to advance to an expert level.
              Don't write anything except of JSON, JUST JSON.
              `  
              }
            ],
            max_tokens: 4096,
            temperature: 0.4,
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
      if (content.trim().charAt(0) !== '{') {
        let lines = content.trim().split('\n');

        // 첫 줄과 마지막 줄 제거
        lines = lines.slice(1, -1);

        // 다시 합치기
        content = lines.join('\n');
    }

      const now = new Date();
  
      // 해당 topic에 대한 기존 데이터를 DB에서 검색
      const existingRoadmap = await this.roadmapRepository.findOne({
        where: { googleId: user.googleId, subject: subject },
        order: { created_at: 'DESC' }
      });
  
      if (existingRoadmap) {
        // 기존 데이터가 있을 경우 덮어쓰기
        existingRoadmap.content = content;
        existingRoadmap.updated_at = now;
        await this.roadmapRepository.save(existingRoadmap);
      } else {
        // 기존 데이터가 없을 경우 새로 생성
        const newRoadmap = this.roadmapRepository.create({
          googleId: user.googleId,
          subject: subject,
          content: content,
          created_at: now,
        });
  
        await this.roadmapRepository.save(newRoadmap);
      }

    } catch (error) {
      console.error('Error generating or saving text:', error);
      throw new HttpException(
        'Failed to generate or save text',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  

  // 최근 업데이트된 순서로 주제 목록을 반환하는 함수
  async getRecentSubjects(user: Payload) {
    try {
      const roadmaps = await this.roadmapRepository.find({
        where: { googleId: user.googleId },
        order: { updated_at: 'DESC' }
      });
  
      // 각 roadmap 객체에서 topic만 추출
      const subjects = roadmaps.map(roadmap => roadmap.subject);
  
      return subjects;
    } catch (error) {
      console.error('Error retrieving recent topics:', error);
      throw new HttpException(
        'Failed to retrieve recent topics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 특정 주제의 콘텐츠를 반환하는 함수
  async getRoadmapContent(user: Payload, subject: string): Promise<string> {
    try {
      const roadmap = await this.roadmapRepository.findOne({
        where: { googleId: user.googleId, subject: subject }
      });

      if (!roadmap) {
        throw new HttpException('Roadmap not found', HttpStatus.NOT_FOUND);
      }

      return roadmap.content;
    } catch (error) {
      console.error('Error retrieving roadmap content:', error);
      throw new HttpException(
        'Failed to retrieve roadmap content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateTopicPassStatus(
    googleId: string,
    subject: string,
    topic: string,
  ): Promise<void> {
    try {
      // DB에서 주어진 subject와 googleId에 맞는 Roadmap을 가져옴
      const roadmap = await this.roadmapRepository.findOne({
        where: { googleId, subject },
      });
  
      if (!roadmap) {
        throw new HttpException('Roadmap not found', HttpStatus.NOT_FOUND);
      }
  
      // Roadmap의 content를 JSON으로 파싱
      let roadmapContent = JSON.parse(roadmap.content);
  
      // 입력받은 topic에 해당하는 섹션을 찾음
      const matchingSection = roadmapContent.roadmap.find(
        (section) => section.title === topic,
      );
  
      if (!matchingSection) {
        throw new HttpException(
          'Title not found in the roadmap',
          HttpStatus.NOT_FOUND,
        );
      }
  
      // pass 값을 true로 변경
      matchingSection.pass = true;
  
      // 변경된 내용을 다시 JSON으로 변환하여 저장
      roadmap.content = JSON.stringify(roadmapContent);
      await this.roadmapRepository.save(roadmap);
  
    } catch (error) {
      console.error('Error updating pass status:', error);
      throw new HttpException(
        'Failed to update pass status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateconceptPassStatus(
    googleId: string,
    subject: string,
    topic: string,
    concept: string
  ): Promise<void> {
    // 1. DB에서 해당 googleId와 subject를 가진 Roadmap을 찾음
    const roadmap = await this.roadmapRepository.findOne({
      where: { googleId, subject },
    });
  
    // 2. Roadmap이 없을 경우 에러를 발생시킴
    if (!roadmap) {
      throw new HttpException('Roadmap not found', HttpStatus.NOT_FOUND);
    }
  
    // 3. Roadmap의 content를 JSON 객체로 파싱
    let roadmapContent = JSON.parse(roadmap.content);
  
    // 4. roadmapContent 내의 'roadmap' 배열에서 주어진 topic을 찾음
    const targetTopic = roadmapContent.roadmap.find(
      (t) => t.title === topic
    );
  
    // 5. topic이 존재하지 않을 경우 에러 발생
    if (!targetTopic) {
      throw new HttpException('Topic not found', HttpStatus.NOT_FOUND);
    }
  
    // 6. targetTopic의 'topics' 배열에서 주어진 concept을 찾음
    const targetConcept = targetTopic.topics.find(
      (c) => c.title === concept
    );
  
    // 7. concept이 존재하지 않을 경우 에러 발생
    if (!targetConcept) {
      throw new HttpException('Concept not found', HttpStatus.NOT_FOUND);
    }
  
    // 8. 찾은 concept의 pass 값을 true로 변경
    targetConcept.pass = true;
  
    // 9. 수정된 content를 다시 문자열로 변환
    roadmap.content = JSON.stringify(roadmapContent);
  
    // 10. 수정된 roadmap을 DB에 저장
    await this.roadmapRepository.save(roadmap);
  }
  
}
