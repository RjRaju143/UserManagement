import jwt from 'jsonwebtoken';
import { AuthGroup, AuthToken, UserGroup } from '../models/index.js';
import { jwtConfig } from '#config/jwt';
import { AppDataSource } from '#config/database';
import { TokenData, TokenResponce } from "../interfaces/index.js"

export const createToken = async (data: TokenData): Promise<TokenResponce | Error> => {
    try {
        const existingToken = await AppDataSource.manager.findOne(AuthToken, { where: { user: { id: data.id } } });
        const accessToken = jwt.sign({ id: data.id, userType: data.userType }, jwtConfig.jwt.secret, {
            expiresIn: jwtConfig.jwt.accessTokenExpiresIn,
        });
        const refreshToken = jwt.sign({ id: data.id, userType: data.userType }, jwtConfig.jwt.secret, {
            expiresIn: jwtConfig.jwt.refreshTokenExpiresIn,
        });
        if (existingToken) {
            const result = await AppDataSource.manager.update(AuthToken, { user: { id: data.id } }, { accessToken, refreshToken });
            if (result.affected === 0) {
                throw new Error('Token not found');
            }
            return { accessToken, refreshToken };
        }
        const authToken = AppDataSource.manager.create(AuthToken, { accessToken, refreshToken, user: { id: data.id } });
        await AppDataSource.manager.save(authToken);
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error)
        return error as Error;
    }
};

export const handleGroupUpdates = async (userId: number, groupIds: string | string[]) => {
    const idsArray = Array.isArray(groupIds) ? groupIds : [groupIds];
    const parsedGroupIds = idsArray.flatMap(id => {
        const parsedNum = typeof id === 'string' ? Number(id.trim()) : id; // Convert to number
        return isNaN(parsedNum) ? null : parsedNum; // Return null for invalid numbers
    }).filter(n => n !== null) as number[]; // Filter out null values
    const currentUserGroups = await AppDataSource.manager.find(UserGroup, {
        where: { user: { id: userId } },
        relations: ['group']
    });
    const currentGroupIds = currentUserGroups.map(ug => ug.group.id);
    await Promise.all(
        parsedGroupIds.map(async (g) => {
            const groupEntity = await AppDataSource.manager.findOne(AuthGroup, { where: { id: g } });
            if (groupEntity) {
                if (!currentGroupIds.includes(g)) {
                    await AppDataSource.manager.save(UserGroup, { user: { id: userId }, group: groupEntity });
                    console.log(`Added group ID ${g} for user ${userId}`);
                } else {
                    console.log(`Group ID ${g} already exists for user ${userId}`);
                }
            } else {
                console.warn(`Group with ID ${g} not found`);
            }
        })
    );

    const groupsToRemove = currentGroupIds.filter(id => !parsedGroupIds.includes(id as number));
    await Promise.all(
        groupsToRemove.map(async (g) => {
            await AppDataSource.manager.delete(UserGroup, { user: { id: userId }, group: { id: g } });
            console.log(`Removed group ID ${g} from user ${userId}`);
        })
    );
}

export const handleGroupUpdatesForUser = async (userId: number, groupIds: number[]) => {
    const currentUserGroups = await AppDataSource.manager.find(UserGroup, {
        where: { user: { id: userId } },
        relations: ['group']
    });
    const currentGroupIds = currentUserGroups.map(ug => ug.group.id);
    const groupsToAdd = groupIds.filter(id => !currentGroupIds.includes(id));
    await Promise.all(
        groupsToAdd.map(async (g) => {
            const groupEntity = await AppDataSource.manager.findOne(AuthGroup, { where: { id: g } });
            if (groupEntity) {
                await AppDataSource.manager.save(UserGroup, { user: { id: userId }, group: groupEntity });
                console.log(`Added group ID ${g} for user ${userId}`);
            } else {
                console.warn(`Group with ID ${g} not found`);
            }
        })
    );
    const groupsToRemove = currentGroupIds.filter(id => !groupIds.includes(id as number));
    await Promise.all(
        groupsToRemove.map(async (g) => {
            await AppDataSource.manager.delete(UserGroup, { user: { id: userId }, group: { id: g } });
            console.log(`Removed group ID ${g} from user ${userId}`);
        })
    );
}

