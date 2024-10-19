import hashing from '@adonisjs/core/services/hash';
import { AppDataSource } from "#config/database";
import { AuthGroup, AuthUser, UserGroup } from "#models/index"
import { CreateUserRequest, CreateUserResponse } from "#interfaces/index"
import { In } from 'typeorm';

export class UserCreationService {
    public async createUser(
        { username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds }: CreateUserRequest
    ): Promise<CreateUserResponse> {
        try {
            const existingUser = await AppDataSource.manager.findOne(AuthUser, { where: { username } });
            if (existingUser) {
                return { status: 400, message: 'Username already exists.' };
            }

            const existingEmail = await AppDataSource.manager.findOne(AuthUser, { where: { email } });
            if (existingEmail) {
                return { status: 400, message: 'Email already exists.' };
            }

            const existingPhone = await AppDataSource.manager.findOne(AuthUser, { where: { phone } });
            if (existingPhone) {
                return { status: 400, message: 'Phone number already exists.' };
            }

            const userGroups = await AppDataSource.manager.find(AuthGroup, { where: { id: In(groupIds) } });
            const validGroupIds = userGroups.map(group => group.id);
            const invalidGroupIds = groupIds.filter(groupId => !validGroupIds.includes(groupId));

            if (invalidGroupIds.length > 0) {
                return { status: 400, message: `Invalid group IDs: ${invalidGroupIds.join(', ')}` };
            }

            const hashedPassword = await hashing.make(password);
            const userData = { username, password: hashedPassword, email, isAdmin, firstname, lastname, phone, gender };
            const newUser = AppDataSource.manager.create(AuthUser, userData as never);
            const newUserSavedData = await AppDataSource.manager.save(newUser);

            const validUserGroups = await Promise.all(validGroupIds.map(async (groupId) => {
                const authGroup = await AppDataSource.manager.findOne(AuthGroup, { where: { id: groupId } });
                if (authGroup) {
                    const userGroup = AppDataSource.manager.create(UserGroup, { group: authGroup, user: newUserSavedData });
                    await AppDataSource.manager.save(userGroup);
                    return { id: authGroup.id, name: authGroup.name };
                }
                return null;
            }));

            const filteredUserGroups = validUserGroups.filter((group): group is { id: number; name: string } => group !== null);

            return {
                status: 201,
                username: newUserSavedData.username,
                email: newUserSavedData.email,
                isAdmin: newUserSavedData.isAdmin,
                firstname: newUserSavedData.firstname,
                lastname: newUserSavedData.lastname,
                phone: newUserSavedData.phone,
                gender: newUserSavedData.gender,
                groups: filteredUserGroups,
                group_ids: filteredUserGroups.map(group => group.id),
            };
        } catch (error: unknown) {
            console.error('Internal Server Error', error);
            return { status: 500, message: 'Internal Server Error' };
        }
    }
}
