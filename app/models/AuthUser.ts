import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('auth_user')
export class AuthUser extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: 'varchar', unique: true })
    username: string = '';

    @Column({ type: 'varchar' })
    password: string = '';

    @Column({ type: 'varchar', unique: true })
    email: string = '';

    @Column({ type: 'boolean', default: false })
    isAdmin: boolean = false;

    @Column({ type: 'boolean', default: false })
    isSuperuser: boolean = false;

    @Column({ type: 'boolean', default: false })
    isStaff: boolean = false;

    @Column({ type: 'boolean', default: false })
    isGuest: boolean = false;

    @Column({ type: 'boolean', default: false })
    isDefaultPassword: boolean = false;

    @Column({ type: 'varchar' })
    firstname: string = '';

    @Column({ type: 'varchar' })
    lastname: string = '';

    @Column({ type: 'bigint', unique: true })
    phone: number = 0;

    @Column({ type: 'integer', nullable: true, default: null })
    otp: number | null = null;

    @Column({ type: 'varchar', default: '0.000000' })
    latitude: string = '0.000000';

    @Column({ type: 'varchar', default: '0.000000' })
    longitude: string = '0.000000';

    @Column({ type: 'varchar', nullable: true })
    gender: string | null = null;

    @Column({ type: 'boolean', default: false })
    isEmailVerified: boolean = false;

    @Column({ type: 'boolean', default: false })
    isActive: boolean = false;

    @Column({ type: 'boolean', default: false })
    isPhoneVerified: boolean = false;

    @Column({ type: 'varchar', default: 'User' })
    userType: string = 'User';

    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date | null = null;

    @Column({ type: 'integer', nullable: true })
    deviceAccess: number | null = null;

    @Column({ type: 'varchar', nullable: true })
    address: string | null = null;

    @Column({ type: 'integer' })
    pincode: number = 0;

    @Column({ type: 'varchar', nullable: true })
    erpCode: string | null = null;

    @Column({ type: 'varchar', nullable: true })
    erpId: string | null = null;
}
