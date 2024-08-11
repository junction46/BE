
import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Roadmap } from "../Entity/common.entity";

@Injectable()
export class RoadmapRepository extends Repository<Roadmap> {
    constructor(dataSource: DataSource) {
        super(Roadmap, dataSource.createEntityManager());
    }
}