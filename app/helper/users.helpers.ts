import jwt from 'jsonwebtoken';
import logger from '@adonisjs/core/services/logger';
import { AuthPermission, AuthToken } from '#models/index';
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

///////
export const checkUserPermissions = async (userPermissions: string[], code: string): Promise<boolean> => {
    try {
        // Fetch the relevant permissions from the database
        const authPermissions = await AppDataSource.manager.find(AuthPermission, { where: { codename: code } });
        console.log({ authPermissions });

        // Extract valid codenames from the fetched permissions
        const validCodenames = new Set(authPermissions.map(p => p.codename));
        console.log({ validCodenames });

        // Log the user's permissions for comparison
        console.log({ userPermissions });

        // Check if the user has the required permission
        const hasGroupsPermission = userPermissions.includes(code);
        console.log({ hasGroupsPermission });
        console.log({ code });

        return hasGroupsPermission;
    } catch (error) {
        logger.error('Error checking user permissions:', error);
        return false;
    }
};
