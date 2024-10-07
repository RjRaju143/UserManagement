import hashing from '@adonisjs/core/services/hash';
import logger from '@adonisjs/core/services/logger';
import jwt from 'jsonwebtoken';
import { AppDataSource } from "#config/database";
import { jwtConfig } from "#config/jwt";
import { AuthUser, UserGroup, AuthToken } from "#models/index"
import { CreateUserRequest, CreateUserResponse, GetAllUsersResponse, LoginResponse, UpdateUserRequest, LoginRequest, SuperUserRequest, SuperUserResponce, User, UserPermissions } from "#interface/user_interface"
import { RefreshTokenResponse } from "#interface/tokens_interface"
import { createToken } from "#helper/users.helpers"
import { UserCreationService } from "#service/UserCreate"
import { In, Like } from 'typeorm';

export class UserService {
  private userCreationService: UserCreationService;

  constructor() {
    this.userCreationService = new UserCreationService();
  }

  public async create(
    { username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds }: CreateUserRequest, user: User, userPermissions: UserPermissions): Promise<CreateUserResponse> {

    if (user.isSuperuser) {
      return await this.userCreationService.createUser({ username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds });
    }

    if (user.isAdmin || userPermissions.includes('view_user')) {
      return await this.userCreationService.createUser({ username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds });
    }

    return { status: 403, message: "Forbidden" };
  }

  public async getAll(user: User, userPermissions: UserPermissions, search: string | undefined, page: number, page_size: number): Promise<GetAllUsersResponse> {
    console.log('Search:', search, 'Page:', page, 'Page Size:', page_size);
    try {
      const skip = (page - 1) * page_size;

      const searchCondition = search
        ? [
          { username: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
          { firstname: Like(`%${search}%`) },
          { lastname: Like(`%${search}%`) }
        ]
        : {};

      if (user.isSuperuser) {
        const [users, total] = await AppDataSource.manager.findAndCount(AuthUser, {
          where: searchCondition,
          skip,
          take: page_size,
          order: { username: 'ASC' } // Add ordering if needed
        });

        const usersWithoutPassword = users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });

        return {
          status: 200,
          results: usersWithoutPassword,
          total,
          page,
          page_size,
          total_pages: Math.ceil(total / page_size)
        };
      }

      if (user.isAdmin || userPermissions.includes('view_user')) {
        const userGroups = await AppDataSource.manager.find(UserGroup, {
          where: { user: { id: user.id } },
          relations: ['group']
        });
        if (userGroups.length === 0) {
          return { status: 404, message: 'User is not a member of any group' };
        }
        const groupIds = userGroups.map(ug => ug.group.id);

        const [usersInGroups, total] = await AppDataSource.manager.findAndCount(UserGroup, {
          where: {
            group: { id: In(groupIds) },
            user: searchCondition
          },
          relations: ['user', 'group'],
          skip,
          take: page_size,
        });

        const uniqueUsers = new Map();
        usersInGroups.forEach(ug => {
          const { password, ...userWithoutPassword } = ug.user;
          if (!uniqueUsers.has(userWithoutPassword.id)) {
            uniqueUsers.set(userWithoutPassword.id, {
              ...userWithoutPassword,
              groups: [],
              group_ids: []
            });
          }

          const groupInfo = {
            id: ug.group.id,
            name: ug.group.name
          };
          uniqueUsers.get(userWithoutPassword.id).groups.push(groupInfo);
          uniqueUsers.get(userWithoutPassword.id).group_ids.push(ug.group.id);
        });

        return {
          status: 200,
          results: Array.from(uniqueUsers.values()),
          total,
          page,
          page_size,
          total_pages: Math.ceil(total / page_size)
        };
      }
      return { status: 403, message: "Forbidden" };
    } catch (error: unknown) {
      logger.error('Error in getAll service method:', error);
      return { status: 500, message: 'Error updating user' };
    }
  }

  public async getById(id: number, user: User, userPermissions: UserPermissions) {
    if (user.isSuperuser) {
      const userById = await AppDataSource.manager.findOne(AuthUser, { where: { id } });
      if (!userById) {
        return { status: 404, message: 'User not found' };
      }
      const userGroups = await AppDataSource.manager.find(UserGroup, { where: { user: { id: userById.id } } });
      const groups = userGroups.map(userGroup => ({
        id: userGroup.group.id,
        name: userGroup.group.name
      }));
      const groupIds = userGroups.map(userGroup => userGroup.group.id);
      return {
        status: 200,
        ...userById,
        groups,
        group_ids: groupIds
      };
    }

    if (user.isAdmin || userPermissions.includes('view_user')) {
      const userGroups = await AppDataSource.manager.find(UserGroup, { where: { user: { id: user.id } } });

      if (!userGroups || userGroups.length === 0) {
        return { status: 404, message: 'User is not a member of any group' };
      }

      const groupIds = userGroups.map(group => group.group.id);

      const usersInGroup = await AppDataSource.manager.find(UserGroup, {
        where: { group: { id: In(groupIds) } },
        relations: ['user']
      });

      const users = usersInGroup.map(userGroup => userGroup.user);
      const requestedUserInGroup = users.find(u => u.id === id);

      if (requestedUserInGroup) {
        const groups = userGroups.map(userGroup => ({
          id: userGroup.group.id,
          name: userGroup.group.name
        }));

        return {
          status: 200,
          ...requestedUserInGroup,
          groups,
          group_ids: groupIds
        };
      } else {
        return { status: 403, message: "You do not have permission to view this user" };
      }
    }

    return { status: 403, message: "Forbidden" };
  }

  public async update(userId: number, { username, email, isAdmin, isStaff, isGuest, firstname, lastname, phone, gender, isActive, userType }: UpdateUserRequest, user: User, userPermissions: UserPermissions) {
    try {
      if (user.isSuperuser) {
        const result = await AppDataSource.manager.update(AuthUser, userId, {
          username, email, isAdmin, isStaff, isGuest, firstname, lastname, phone, gender, isActive, userType
        });

        if (result.affected === 0) {
          return { status: 404, message: 'User not found' };
        }

        return { status: 200, message: 'User updated successfully' };
      }

      if (user.isAdmin || userPermissions.includes('edit_user')) {
        const userGroups = await AppDataSource.manager.find(UserGroup, {
          where: { user: { id: user.id } },
          relations: ['group']
        });
        const groupIds = userGroups.map(ug => ug.group.id);
        const targetUserGroups = await AppDataSource.manager.find(UserGroup, {
          where: { user: { id: userId } },
          relations: ['group']
        });
        const targetGroupIds = targetUserGroups.map(ug => ug.group.id);
        const hasSameGroup = targetGroupIds.some(id => groupIds.includes(id));
        if (!hasSameGroup) {
          return { status: 403, message: "Forbidden: You cannot update this user as they are not in the same group." };
        }

        const result = await AppDataSource.manager.update(AuthUser, userId, {
          username, email, isAdmin, isStaff, isGuest, firstname, lastname, phone, gender, isActive, userType
        });
        if (result.affected === 0) {
          return { status: 404, message: 'User not found' };
        }

        return { status: 200, message: 'User updated successfully' };
      }

      return { status: 403, message: "Forbidden" };
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
      if (!isPasswordValid) {
        return { status: 400, message: "User or Password Incorrect" };
      }

      const tokens = await createToken({ id: userExist.id, userType: userExist.userType });

      if ('accessToken' in tokens && 'refreshToken' in tokens) {
        return { status: 200, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
      } else {
        logger.error('Token creation error:', tokens);
        return { status: 500, message: 'Error creating tokens' };
      }
    } catch (error) {
      logger.error('Error during login:', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }

  public async su({ username, password, }: SuperUserRequest): Promise<SuperUserResponce> {
    try {
      const userExist = await AppDataSource.manager.findOne(AuthUser, {
        where: [
          { username }
        ]
      });
      if (userExist) {
        return { status: 400, message: 'User already exist' };
      }
      const hashedPassword = await hashing.make(password);
      const userData = { username, password: hashedPassword, isSuperuser: true, isAdmin: true, userType: "su" };
      const newUser = AppDataSource.manager.create(AuthUser, userData);
      await AppDataSource.manager.save(newUser);
      return { status: 201, message: "User Created" };
    } catch (error: unknown) {
      logger.error('Error during login:', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }

  public async refreshToken(refresh: string): Promise<RefreshTokenResponse> {
    try {
      const token = await AppDataSource.manager.findOne(AuthToken, { where: { refreshToken: refresh } });

      if (!token) {
        return { status: 400, message: "Unauthorized" };
      }

      if (!token.refreshToken) {
        return { status: 400, message: "Refresh token is missing" };
      }

      const decoded = jwt.verify(token.refreshToken, jwtConfig.jwt.secret) as { id: number; userType: string };

      const newAccessToken = jwt.sign({ id: decoded.id, userType: decoded.userType }, jwtConfig.jwt.secret, {
        expiresIn: jwtConfig.jwt.accessTokenExpiresIn,
      });

      const updateResult = await AppDataSource.manager.update(AuthToken, { user: { id: token.user?.id } }, { accessToken: newAccessToken });

      if (updateResult.affected === 0) {
        throw new Error('Token not found');
      }

      return { status: 201, accessToken: newAccessToken };

    } catch (error: unknown) {
      logger.error('Error refreshing token:', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }
}

