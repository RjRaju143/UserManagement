import hashing from '@adonisjs/core/services/hash';
import { AppDataSource } from "#config/database";
import { AuthGroup, AuthUser, UserGroup } from "#models/index"
import { CreateUserRequest, CreateUserResponse } from "#interface/user_interface"

export class UserCreationService {
    public async createUser(
        { username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds }: CreateUserRequest
    ): Promise<CreateUserResponse> {
        try {
            const hashedPassword = await hashing.make(password);
            const userData = { username, password: hashedPassword, email, isAdmin, firstname, lastname, phone, gender };
            const newUser = AppDataSource.manager.create(AuthUser, userData);
            const newUserSavedData = await AppDataSource.manager.save(newUser);

            const userGroupsPromises = groupIds.map(async (groupId) => {
                const authGroup = await AppDataSource.manager.findOne(AuthGroup, { where: { id: groupId } });
                if (authGroup) {
                    const userGroup = AppDataSource.manager.create(UserGroup, { group: authGroup, user: newUserSavedData });
                    await AppDataSource.manager.save(userGroup);
                    return { id: authGroup.id, name: authGroup.name };
                }
                console.error(`Group with id ${groupId} not found.`);
                return null;
            });

            const userGroups = await Promise.all(userGroupsPromises);
            const validUserGroups = userGroups.filter((group): group is { id: number; name: string } => group !== null);

            return {
                status: 201,
                username: newUserSavedData.username,
                email: newUserSavedData.email,
                isAdmin: newUserSavedData.isAdmin,
                firstname: newUserSavedData.firstname,
                lastname: newUserSavedData.lastname,
                phone: newUserSavedData.phone,
                gender: newUserSavedData.gender,
                groups: validUserGroups,
                group_ids: validUserGroups.map(group => group.id),
            };
        } catch (error: unknown) {
            console.error('Error creating user:', error);
            return { status: 500, message: 'Error creating user' };
        }
    }
}
