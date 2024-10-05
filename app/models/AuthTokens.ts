import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AuthUser } from "#models/index"

@Entity('auth_token')
export class AuthToken {
    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => AuthUser, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user?: AuthUser;

    @Column({ type: 'varchar', length: 512 })
    accessToken?: string;

    @Column({ type: 'varchar', length: 512 })
    refreshToken?: string;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}
