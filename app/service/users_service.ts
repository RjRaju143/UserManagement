import hashing from '@adonisjs/core/services/hash';
import logger from '@adonisjs/core/services/logger';
import jwt from 'jsonwebtoken';
import { AppDataSource } from "#config/database";
import { jwtConfig } from "#config/jwt";
import { AuthUser, UserGroup, AuthToken } from "#models/index"
import { CreateUserRequest, CreateUserResponse, GetAllUsersResponse, LoginResponse, UpdateUserRequest, LoginRequest, SuperUserRequest, SuperUserResponce } from "#interface/user_interface"
import { RefreshTokenResponse } from "#interface/tokens_interface"
import { createToken, checkUserPermissions } from "#helper/users.helpers"
import { UserCreationService } from "#service/UserCreate"

export class UserService {
  private userCreationService: UserCreationService;

  constructor() {
    this.userCreationService = new UserCreationService();
  }

  public async create(
    { username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds }: CreateUserRequest,
    user: { isAdmin: boolean; is_superuser: boolean },
    userPermissions: { codename: string }[]
  ): Promise<CreateUserResponse> {

    if (userPermissions) {
      const hasGroupsPermission = await checkUserPermissions(userPermissions.map(p => p.codename), 'add_user');
      if (user.isAdmin || hasGroupsPermission) {
        return await this.userCreationService.createUser({ username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds });
      }
    } else if (user.is_superuser) {
      return await this.userCreationService.createUser({ username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds });
    }

    return { status: 403, message: "Forbidden" };
  }

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
    } catch (error) {
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

    } catch (error) {
      logger.error('Error refreshing token:', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }
}

