import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { AuthUser, AuthGroup } from "#models/index"

@Entity('user_group')
export class UserGroup extends BaseEntity {

    constructor(user: AuthUser, group: AuthGroup) {
        super();
        this.user = user;
        this.group = group;
    }

    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => AuthUser, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: AuthUser;

    @ManyToOne(() => AuthGroup, { eager: true })
    @JoinColumn({ name: 'group_id' })
    group: AuthGroup;
}
