import { Entity, PrimaryGeneratedColumn,  ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { AuthPermission } from './AuthPermission.js'; // Adjust the import path based on your structure
import { AuthGroup } from './AuthGroup.js'; // Adjust the import path based on your structure

@Entity('auth_group_permissions')
export class AuthGroupPermissions extends BaseEntity {
    @PrimaryGeneratedColumn() // Automatically generates a unique ID
    id?: number;

    @ManyToOne(() => AuthPermission, { eager: true })
    @JoinColumn({ name: 'permission_id' }) // This is the foreign key in the database
    permission?: AuthPermission;

    @ManyToOne(() => AuthGroup)
    @JoinColumn({ name: 'group_id' }) // This is the foreign key in the database
    group?: AuthGroup;

    // Add additional fields if necessary
}
