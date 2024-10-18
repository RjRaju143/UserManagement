import hashing from '@adonisjs/core/services/hash';
import jwt from 'jsonwebtoken';
import { AppDataSource } from "#config/database";
import { jwtConfig } from "#config/jwt";
import { AuthUser, UserGroup, AuthToken, AuthGroup, AuthGroupPermissions, AuthPermission } from "#models/index"
import { CreateUserRequest, CreateUserResponse, GetAllUsersResponse, LoginResponse, UpdateUserRequest, LoginRequest, SuperUserRequest, SuperUserResponce, User, UserPermissions, getGroupByIdResponse, getGroupsResponse, UpdateResponse, RefreshTokenResponse, CreateGroupRequest, CreateGroupResponse, UpdateGroupResponse } from "#interface/index"
import { createToken, handleGroupUpdates, handleGroupUpdatesForUser } from "#helper/users.helpers"
import { UserCreationService } from "#service/UserCreate"
import { In, Like, Not } from 'typeorm';

export class UserService {
  private userCreationService: UserCreationService;

  constructor() {
    this.userCreationService = new UserCreationService();
  }

  public async create(payload: CreateUserRequest, user: User, userPermissions: UserPermissions): Promise<CreateUserResponse> {
    const { username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds } = payload;
    try {
      if (user.isSuperuser) {
        return await this.userCreationService.createUser({ username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds });
      }

      if (user.isAdmin || userPermissions.includes('add_user')) {
        const userGroups = await AppDataSource.manager.find(UserGroup, { where: { user: { id: user.id } } });
        if (userGroups.length === 0) {
          return { status: 404, message: "User does not belong to any group." }
        }

        const userGroupIds = userGroups.map(ug => ug.group.id);
        const invalidGroupIds = groupIds.map(id => Number(id)).filter(groupId => !userGroupIds.includes(groupId));
        if (invalidGroupIds.length > 0) {
          const invalidNumbers = [...invalidGroupIds];
          return { status: 400, message: `Invalid group IDs: ${invalidNumbers.join(', ')}` }
        }

        return await this.userCreationService.createUser({ username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds });
      }

      return { status: 403, message: "Forbidden" }
    } catch (error: unknown) {
      console.error('Internal Server Error', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }

  public async getAllUsers(user: User, userPermissions: UserPermissions, search: string | undefined, page: number, page_size: number): Promise<GetAllUsersResponse> {
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
            user: { isDelete: false, ...searchCondition }
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
      console.error('Internal Server Error', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }

  public async getUserById(id: number, user: User, userPermissions: UserPermissions) {
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

  public async updateUser(userId: number, { username, email, isAdmin, firstname, lastname, phone, gender, groupIds, isDelete }: UpdateUserRequest, user: User, userPermissions: UserPermissions): Promise<UpdateResponse> {
    try {
      if (user.isSuperuser) {
        const result = await AppDataSource.manager.update(AuthUser, userId, {
          username, email, isAdmin, firstname, lastname, phone, gender, isDelete
        });

        if (result.affected === 0) {
          return { status: 404, message: 'User not found' };
        }

        await handleGroupUpdates(userId, groupIds);
        return { status: 200, message: 'User updated successfully' };
      }

      if (user.isAdmin || userPermissions.includes('change_user')) {
        const parsedGroupIds = Array.isArray(groupIds)
          ? groupIds.map(Number)
          : [parseInt(groupIds)];

        const userGroups = await AppDataSource.manager.find(UserGroup, {
          where: { user: { id: user.id } },
          relations: ['group']
        });
        const groupIdsUser = userGroups.map(ug => ug.group.id);
        const allGroupsAllowed = parsedGroupIds.every(gid => groupIdsUser.includes(gid));
        if (!allGroupsAllowed) {
          return { status: 403, message: "Forbidden: You cannot use this group." };
        }

        const targetUserGroups = await AppDataSource.manager.find(UserGroup, {
          where: { user: { id: userId } },
          relations: ['group']
        });
        const targetGroupIds = targetUserGroups.map(ug => ug.group.id);
        const commonGroupIds = targetGroupIds.filter(id => groupIdsUser.includes(id)) as number[];
        if (commonGroupIds.length === 0) {
          return { status: 403, message: "Forbidden: You cannot update this user as they are not in the same group." };
        }

        const result = await AppDataSource.manager.update(AuthUser, userId, {
          username, email, isAdmin, firstname, lastname, phone, gender
        });
        if (result.affected === 0) {
          return { status: 404, message: 'User not found' };
        }

        await handleGroupUpdatesForUser(userId, commonGroupIds);

        return { status: 200, message: 'User updated successfully' };
      }
    }
    catch (error: unknown) {
      console.error('Internal Server Error', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }

  public async login(payload: LoginRequest): Promise<LoginResponse> {
    const { username, password, email } = payload
    try {
      const userExist = await AppDataSource.manager.findOne(AuthUser, {
        where: [{ username }, { email }]
      });

      if (!userExist || userExist.isDelete) {
        return { status: 404, message: 'User not found' };
      }

      const isPasswordValid = await hashing.verify(userExist.password, password);
      if (!isPasswordValid) {
        return { status: 400, message: "User or Password Incorrect" };
      }

      const tokens = await createToken({ id: userExist.id, userType: userExist.userType });

      if ('accessToken' in tokens && 'refreshToken' in tokens) {
        return { status: 201, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
      } else {
        console.error('Token creation error:', tokens);
        return { status: 500, message: 'Error creating tokens' };
      }
    } catch (error) {
      console.error('Error during login:', error);
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
      console.error('Error during login:', error);
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
      console.error('Error refreshing token:', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }

  public async getGroups(user: User, userPermissions: UserPermissions, search: string | undefined, page: number, page_size: number): Promise<getGroupsResponse> {
    try {
      const skip = (page - 1) * page_size;
      const searchCondition = search ? { name: Like(`%${search}%`) } : {};

      if (user.isSuperuser) {
        const [groups, _] = await AppDataSource.manager.findAndCount(AuthGroup, {
          where: searchCondition,
          skip,
          take: page_size,
          order: { name: 'ASC' }
        });
        const groupPermissionsPromises = groups.map(async (g) => {
          return await AppDataSource.manager.find(AuthGroupPermissions, { where: { group: { id: g.id } } });
        });
        const groupPermissions = await Promise.all(groupPermissionsPromises);
        const formattedResults = groups.map((group, index) => {
          return {
            id: group.id,
            name: group.name,
            permission_ids: groupPermissions[index].map(p => p.permission?.id),
            reporting_to: group.reporting_to,
            isStatic: group.isStatic,
            is_delete: group.isDelete,
          };
        });

        return { status: 200, results: formattedResults };
      }
      if (user.isAdmin || userPermissions.includes('view_groups')) {
        const userGroups = await AppDataSource.manager.find(UserGroup, {
          where: { user: { id: user.id } }
        });
        const groupIds = userGroups.map(ug => ug.group.id);
        const groups = await AppDataSource.manager.find(AuthGroup, {
          where: { id: In(groupIds) }
        });
        const groupPermissionsPromises = groups.map(async (group) => {
          const permissions = await AppDataSource.manager.find(AuthGroupPermissions, {
            where: { group: { id: group.id } }
          });

          return {
            ...group,
            permission_ids: permissions.map(p => p.permission?.id),
            user_count: await AppDataSource.manager.count(UserGroup, {
              where: { group: { id: group.id } }
            })
          };
        });

        const groupsWithDetails = await Promise.all(groupPermissionsPromises);
        const filteredResults = groupsWithDetails.filter(group => group.user_count > 0);
        return { status: 200, results: filteredResults };
      }

      return { status: 403, message: "Forbidden" };

    } catch (error) {
      console.error('Internal Server Error', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }

  public async getGroupById(id: number, user: User, userPermissions: UserPermissions): Promise<getGroupByIdResponse> {
    try {
      if (user.isSuperuser) {
        const groups = await AppDataSource.manager.find(AuthGroup, { where: { id } });
        const permissions = await AppDataSource.manager.find(AuthGroupPermissions, { where: { group: { id } } });

        if (groups.length > 0) {
          const groupDetails = groups[0];

          return {
            status: 200,
            id: groupDetails.id,
            name: groupDetails.name,
            permissions: permissions.map(permission => permission.permission?.id),
            groupdetails: {
              group: groupDetails.id,
              reporting_to: groupDetails.reporting_to,
            }
          };
        }

        return { status: 200, message: "Group not found" };
      }

      if (user.isAdmin || userPermissions.includes('view_groups')) {
        const userGroups = await AppDataSource.manager.find(UserGroup, { where: { user: { id: user.id } } });
        const groupIds = userGroups.map(userGroup => userGroup.group.id);
        if (!groupIds.includes(id)) {
          return { status: 404, message: "Group not found" };
        }

        const userGroup = userGroups.find(userGroup => userGroup.group.id === id);
        if (!userGroup) {
          return { status: 404, message: "Group not found" };
        }

        const group = userGroup.group;
        const permissions = await AppDataSource.manager.find(AuthGroupPermissions, {
          where: { group: { id } }
        });
        const permissionIds = permissions.map(permission => permission.permission?.id);

        return {
          status: 200,
          id: group.id,
          name: group.name,
          permissions: permissionIds,
          reporting_to_id: group.reporting_to || 0,
          groupdetails: {
            group: group.id,
            reporting_to: group.reporting_to || 0,
          }
        };
      }

      return { status: 403, message: "Forbidden" };

    } catch (error: unknown) {
      console.error('Internal Server Error', error);
      return { status: 500, message: "Internal Server Error" }
    }
  }

  public async updateGroupById(id: number, name: string, permission_ids: number[], user: User, userPermissions: UserPermissions): Promise<UpdateGroupResponse> {

    try {
      if (user.isSuperuser) {
        const groupExists = await AppDataSource.manager.findOne(AuthGroup, { where: { id } });
        if (!groupExists) {
          return { status: 404, message: "Group not found." };
        }

        const duplicateGroup = await AppDataSource.manager.findOne(AuthGroup, { where: { name, id: Not(id) } });
        if (duplicateGroup) {
          return { status: 400, message: `A group with the name "${name}" already exists.` };
        }

        const validPermissionsPromise = AppDataSource.manager.find(AuthPermission, { where: { id: In(permission_ids.map(Number)) } });
        const existingPermissionsPromise = AppDataSource.manager.find(AuthGroupPermissions, { where: { group: { id } } });
        const [validPermissions, existingPermissions] = await Promise.all([validPermissionsPromise, existingPermissionsPromise]);
        const validIds = validPermissions.map(permission => permission.id);
        const permissionIdsAsNumbers = permission_ids.map(Number);
        const invalidIds = permissionIdsAsNumbers.filter(id => !validIds.includes(id));
        if (invalidIds.length > 0) {
          return { status: 400, message: `Invalid permission IDs: ${invalidIds}.` };
        }

        const duplicates = permission_ids.filter((id, index) => permission_ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
          return { status: 400, message: `Duplicate permission IDs: ${duplicates}.` };
        }

        await AppDataSource.manager.update(AuthGroup, id, { name });
        const existingPermissionIds = existingPermissions.map(ep => ep.permission?.id);
        const permissionsToRemove = existingPermissionIds.filter(id => !validIds.includes(id));
        if (permissionsToRemove.length > 0) {
          await AppDataSource.manager.delete(AuthGroupPermissions, {
            group: { id },
            permission: { id: In(permissionsToRemove) }
          });
        }

        const permissionsToAdd = validIds.filter(id => !existingPermissionIds.includes(id));
        if (permissionsToAdd.length > 0) {
          const newPermissions = permissionsToAdd.map(permissionId => ({
            group: { id },
            permission: { id: permissionId }
          }));
          await AppDataSource.manager.insert(AuthGroupPermissions, newPermissions);
        }

        const updatedGroup = await AppDataSource.manager.findOne(AuthGroup, { where: { id } });
        const updatedPermissions = await AppDataSource.manager.find(AuthGroupPermissions, { where: { group: { id } } });
        const updatedPermissionIds = updatedPermissions.map(ep => ep.permission?.id);

        return {
          status: 200,
          id: updatedGroup?.id,
          name: updatedGroup?.name,
          permissions: updatedPermissionIds,
          reporting_to_id: updatedGroup?.reporting_to,
          groupdetails: {
            group: updatedGroup?.id,
            reporting_to: updatedGroup?.reporting_to,
          }
        };
      }

      if (user.isAdmin || userPermissions.includes('change_groups')) {
        const userGroups = await AppDataSource.manager.find(UserGroup, {
          where: { user: { id: user.id } },
          relations: ['group']
        });

        const userGroupIds = userGroups.map(gp => gp.group.id);
        if (!userGroupIds.includes(Number(id))) {
          return { status: 403, message: "You do not have permission to update this group." };
        }

        const groupExists = await AppDataSource.manager.findOne(AuthGroup, { where: { id } });
        if (!groupExists) {
          return { status: 404, message: "Group not found." };
        }

        const duplicateGroup = await AppDataSource.manager.findOne(AuthGroup, { where: { name, id: Not(id) } });
        if (duplicateGroup) {
          return { status: 400, message: `A group with the name "${name}" already exists.` };
        }

        const validPermissionsPromise = AppDataSource.manager.find(AuthPermission, { where: { id: In(permission_ids.map(Number)) } });
        const existingPermissionsPromise = AppDataSource.manager.find(AuthGroupPermissions, { where: { group: { id } } });
        const [validPermissions, existingPermissions] = await Promise.all([validPermissionsPromise, existingPermissionsPromise]);
        const validIds = validPermissions.map(permission => permission.id);
        const permissionIdsAsNumbers = permission_ids.map(Number);
        const invalidIds = permissionIdsAsNumbers.filter(id => !validIds.includes(id));
        if (invalidIds.length > 0) {
          return { status: 400, message: `Invalid permission IDs: ${invalidIds}.` };
        }

        const duplicates = permission_ids.filter((id, index) => permission_ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
          return { status: 400, message: `Duplicate permission IDs: ${duplicates}.` };
        }

        await AppDataSource.manager.update(AuthGroup, id, { name });
        const existingPermissionIds = existingPermissions.map(ep => ep.permission?.id);
        const permissionsToRemove = existingPermissionIds.filter(id => !validIds.includes(id));
        if (permissionsToRemove.length > 0) {
          await AppDataSource.manager.delete(AuthGroupPermissions, {
            group: { id },
            permission: { id: In(permissionsToRemove) }
          });
        }

        const permissionsToAdd = validIds.filter(id => !existingPermissionIds.includes(id));
        if (permissionsToAdd.length > 0) {
          const newPermissions = permissionsToAdd.map(permissionId => ({
            group: { id },
            permission: { id: permissionId }
          }));
          await AppDataSource.manager.insert(AuthGroupPermissions, newPermissions);
        }

        const updatedGroup = await AppDataSource.manager.findOne(AuthGroup, { where: { id } });
        const updatedPermissions = await AppDataSource.manager.find(AuthGroupPermissions, { where: { group: { id } } });
        const updatedPermissionIds = updatedPermissions.map(ep => ep.permission?.id);

        return {
          status: 200,
          id: updatedGroup?.id,
          name: updatedGroup?.name,
          permissions: updatedPermissionIds,
          reporting_to_id: updatedGroup?.reporting_to,
          groupdetails: {
            group: updatedGroup?.id,
            reporting_to: updatedGroup?.reporting_to,
          }
        };
      }

      return { status: 403, message: "Forbidden" };
    } catch (error: unknown) {
      console.error('Internal Server Error', error);
      return { status: 500, message: "Internal Server Error" }
    }

  }

  public async logout(user: User) {
    await AppDataSource.manager.delete(AuthToken, { user: user.id });
    return { status: 200, message: "Successfully logged out." };
  }

  public async createGroup({ name, isStatic, permissionsIds }: CreateGroupRequest): Promise<CreateGroupResponse> {
    const existingGroup = await AppDataSource.manager.findOne(AuthGroup, { where: { name } });
    if (existingGroup) {
      return { status: 409, message: `Group with this name '${name}' already exists.` };
    }

    const authGroup = AppDataSource.manager.create(AuthGroup, { name, isStatic });
    const savedGroup = await AppDataSource.manager.save(authGroup);

    const existingPermissions = await AppDataSource.manager.findByIds(AuthPermission, permissionsIds);
    const existingPermissionIds = new Set(existingPermissions.map(permission => permission.id));

    const validPermissionsIds = permissionsIds.filter(id => existingPermissionIds.has(id));

    await Promise.all(validPermissionsIds.map((permissionId) => {
      const authGroupPermissions = new AuthGroupPermissions();
      authGroupPermissions.group = savedGroup;
      authGroupPermissions.permission = { id: Number(permissionId) } as AuthPermission;
      return AppDataSource.manager.save(authGroupPermissions);
    }));

    return {
      status: 201,
      id: savedGroup.id,
      name,
      permission_ids: validPermissionsIds,
      static: isStatic,
    };
  }

}

