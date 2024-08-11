import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Roadmap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  googleId: string;

  @Column()
  subject: string;  //로드맵 주제
  
  @Column('text')
  content: string;  //로드맵 내용

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}