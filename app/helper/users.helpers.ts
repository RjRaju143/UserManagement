import jwt from 'jsonwebtoken';
import logger from '@adonisjs/core/services/logger';
import { AuthGroup, AuthToken, UserGroup } from '#models/index';
import { jwtConfig } from '#config/jwt';
import { AppDataSource } from '#config/database';
import { TokenData, TokenResponce } from "#interface/tokens_interface"

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
        logger.error(error)
        return error as Error;
    }
};

export const handleGroupUpdates = async (userId: number, groupIds: string[]) => {
    const parsedGroupIds = groupIds.flatMap(id => id.split(',').map(Number).filter(n => !isNaN(n)));

    console.log('Parsed group IDs:', parsedGroupIds);

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

