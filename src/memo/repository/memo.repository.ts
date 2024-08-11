import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Memo } from "../entity/memo.entity";


@Injectable()
export class MemoRepository extends Repository<Memo> {
    constructor(dataSource: DataSource) {
        super(Memo, dataSource.createEntityManager());
    }

    async findMemo(subject: string, topic: string, concept: string, googleId: string): Promise<Memo | undefined> {
        return await this.findOne({ where: { subject, topic, concept, googleId } });
    }

    async saveMemo(subject: string, topic: string, concept: string, memo: string, googleId: string): Promise<Memo> {
        // 먼저 동일한 조합의 메모가 있는지 확인
        const existingMemo = await this.findOne({ where: { subject, topic, concept, googleId } });

        if (existingMemo) {
            // 기존 메모가 있으면 업데이트
            existingMemo.memo = memo;
            return await this.save(existingMemo);
        } else {
            // 기존 메모가 없으면 새로 생성
            const newMemo = this.create({ subject, topic, concept, memo, googleId });
            return await this.save(newMemo);
        }
    }
}