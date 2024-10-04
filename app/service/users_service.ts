import jwt from 'jsonwebtoken';
import { AppDataSource } from "#config/database";
import { jwtConfig } from "#config/jwt";
import hashing from '@adonisjs/core/services/hash';
import logger from '@adonisjs/core/services/logger';

import { AuthGroup, AuthUser, UserGroup } from "#models/index"
import { CreateUserRequest, CreateUserResponse, GetAllUsersResponse, LoginResponse, UpdateUserRequest, LoginRequest } from "#interface/user_interface"

export class UserService {
  public async create({ username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds }: CreateUserRequest): Promise<CreateUserResponse> {
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
        logger.error(`Group with id ${groupId} not found.`);
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
    } catch (error) {
      logger.error('Error creating user:', error);
      return { status: 500, message: 'Error creating user' };
    }
  }

  //// TODO:
  public async getAll(): Promise<GetAllUsersResponse> {
    try {
      const users = await AppDataSource.manager.find(AuthUser);
      const usersWithoutPassword = await Promise.all(users.map(async user => {
        const userGroups = await AppDataSource.manager.find(UserGroup, {
          where: { id: user.id },
          relations: ['group']
        });
        const groups = userGroups.map(ug => ({
          id: ug.group.id,
          name: ug.group.name
        }));
        const { password, ...userWithoutPassword } = user;

        return {
          ...userWithoutPassword,
          groups,
          group_ids: groups.map(group => group.id),
        };
      }));

      return { status: 200, results: usersWithoutPassword };
    } catch (error) {
      logger.error('Error fetching users:', error);
      return { status: 500, error: 'Error fetching users' };
    }
  }

  public async getById(id: number) {
    const user = await AppDataSource.manager.findOne(AuthUser, { where: { id } });
    if (!user) {
      return { status: 404, message: 'User not found' };
    }
    return { status: 200, user };
  }

  public async update(userId: number, { username, email, isAdmin, isStaff, isGuest, firstname, lastname, phone, gender, isActive, userType }: UpdateUserRequest) {
    try {
      const result = await AppDataSource.manager.update(AuthUser, userId, {
        username, email, isAdmin, isStaff, isGuest, firstname, lastname, phone, gender, isActive, userType
      });

      if (result.affected === 0) {
        return { status: 404, message: 'User not found' };
      }

      return { status: 200, message: 'User updated successfully' };

    } catch (error) {
      logger.error('Error updating user:', error);
      return { status: 500, message: 'Error updating user' };
    }
  }

  public async login({ username, password, email }: LoginRequest): Promise<LoginResponse> {
    try {
      const userExist = await AppDataSource.manager.findOne(AuthUser, {
        where: [
          { username },
          { email }
        ]
      });
      if (!userExist) {
        return { status: 404, message: 'User not found' };
      }
      const isPasswordValid = await hashing.verify(userExist.password, password);
      if (isPasswordValid) {
        const accessToken = jwt.sign({ id: userExist.id, userType: userExist.userType }, jwtConfig.jwt.secret, {
          expiresIn: jwtConfig.jwt.accessTokenExpiresIn
        });
        const refreshToken = jwt.sign({ id: userExist.id, userType: userExist.userType }, jwtConfig.jwt.secret, {
          expiresIn: jwtConfig.jwt.refreshTokenExpiresIn
        });
        return { status: 200, accessToken, refreshToken };
      }
      return { status: 401, message: 'Invalid credentials' };
    } catch (error) {
      logger.error('Error during login:', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }
}
