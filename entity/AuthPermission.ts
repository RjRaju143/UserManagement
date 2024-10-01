import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('auth_permission')
export class AuthPermission extends BaseEntity {
    constructor() {
        super();
        this.name = '';
        this.codename = '';
    }

    @PrimaryGeneratedColumn() // Automatically generates a unique ID
    id?: number;

    @Column({ type: 'varchar', unique: true })
    name: string;

    @Column({ type: 'varchar', unique: true })
    codename: string;

    // Uncomment and adjust if you want to include context_type_id
    // @Column({ type: 'varchar', nullable: false })
    // context_type_id: string;

}
