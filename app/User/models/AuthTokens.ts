import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { AuthUser } from "./index.js"

@Entity('auth_token')
export class AuthToken extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => AuthUser, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: AuthUser;

    @Column({ type: 'varchar', length: 512 })
    accessToken!: string;

    @Column({ type: 'varchar', length: 512 })
    refreshToken!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
