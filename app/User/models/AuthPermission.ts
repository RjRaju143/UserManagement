import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('auth_permission')
export class AuthPermission extends BaseEntity {
    constructor() {
        super();
        this.name = '';
        this.code = '';
    }

    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: 'varchar', unique: true })
    name: string;

    @Column({ type: 'varchar', unique: true })
    code: string;

}
