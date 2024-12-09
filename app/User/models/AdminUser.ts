import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('admin_user')
export class SuperUser extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', unique: true })
    username!: string;

    @Column({ type: 'varchar' })
    password!: string;

    @Column({ type: 'boolean', default: false })
    isDelete: boolean = false;
}

