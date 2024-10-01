import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { AuthUser } from './User.js'; // Adjust the import path as needed
import { AuthGroup } from './AuthGroup.js'; // Adjust the import path as needed

@Entity('user_group')
export class UserGroup extends BaseEntity {

    constructor(user: AuthUser, group: AuthGroup) {
        super();
        this.user = user;
        this.group = group;
    }

    @PrimaryGeneratedColumn() // Automatically generates a unique ID
    id?: number;

    @ManyToOne(() => AuthUser, { eager: true }) // Eager loading if needed
    @JoinColumn({ name: 'user_id' }) // Foreign key column in the database
    user: AuthUser; // Reference to AuthUser

    @ManyToOne(() => AuthGroup, { eager: true }) // Eager loading if needed
    @JoinColumn({ name: 'group_id' }) // Foreign key column in the database
    group: AuthGroup; // Reference to AuthGroup
}
