import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Memo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  googleId: string;

  @Column()
  subject:string;

  @Column()
  topic : string;

  @Column()
  concept: string;

  @Column()
  memo : string;
}