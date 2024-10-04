import { inject } from '@adonisjs/core';
import { AppDataSource } from "#config/database";

import { AuthGroup, AuthGroupPermissions, AuthPermission } from '#models/index'
import { CreateGroupRequest, CreateGroupResponse } from "#interface/groups_interface"

@inject()
export class UserGroupService {

  public async create({ name, isStatic, permissionsIds }: CreateGroupRequest): Promise<CreateGroupResponse> {
    return await this.createGroup({ name, isStatic, permissionsIds });
  }

  private async createGroup({ name, isStatic, permissionsIds }: CreateGroupRequest): Promise<CreateGroupResponse> {
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


