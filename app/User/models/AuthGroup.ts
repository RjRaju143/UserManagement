import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('auth_group')
export class AuthGroup extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: 'varchar', unique: true })
    name!: string;

    @Column({ type: 'varchar', nullable: true })
    reporting_to!: string;

    @Column({ type: 'boolean', default: false })
    isStatic!: boolean;

    @Column({ type: 'boolean', default: false })
    isDelete!: boolean;
}
