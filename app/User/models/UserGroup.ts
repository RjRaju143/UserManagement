import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { AuthUser, AuthGroup } from "./index.js"

@Entity('user_group')
export class UserGroup extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => AuthUser, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: AuthUser;

    @ManyToOne(() => AuthGroup, { eager: true })
    @JoinColumn({ name: 'group_id' })
    group!: AuthGroup;
}
