import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Roadmap } from "src/common/Entity/common.entity";
import { Memo } from "src/memo/entity/memo.entity";


export const typeORMConfig : TypeOrmModuleOptions = {
    type:'postgres',
    host:'localhost',
    port:5432,
    username:'postgres',
    password: 'password',
    database: 'silkroad',
    entities: [Roadmap, Memo],
    synchronize: true
}
