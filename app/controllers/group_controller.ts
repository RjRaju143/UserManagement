import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import { In } from 'typeorm';

import { AuthPermission, permissions } from "#models/index"
import { UserGroupService } from '#service/group_service';
import { AppDataSource } from "#config/database";
import { CreateGroupValidator } from "#validator/CreateGroupValidator"

@inject()
export default class UserGroupsController {
  constructor(private userGroupService: UserGroupService) { }

  /**
   * @createGroup
   * @operationId createGroup
   * @description Creates a new user group with specified permissions.
   * @requestBody {"name": "stringOne","isStatic": false,"permissionsIds": [1, 2, 3]}
   * @responseBody 201 - {"name": "stringOne","isStatic": false,"permissionsIds": [1, 2, 3]}
   * @paramUse(sortable, filterable)
  */
  public async createGroup({ request, response }: HttpContext) {

    const validatedData = await request.validate({
      schema: CreateGroupValidator,
    });
    const { name, isStatic, permissionsIds } = validatedData;

    try {
      const result = await this.userGroupService.create({ name, isStatic, permissionsIds });
      return response.status(result.status).json(result);
    } catch (error) {
      console.error('Error creating user group:', error);
      return response.status(500).json({ message: 'Error creating user group', error });
    }
  }

  /**
   * @createPermissions
   * @operationId createPermissions
   * @description Creates a new Permissions with specified codes.
   * @responseBody 201 - {"status": 201,"savedAuthPermissions": [{"id": 1,"name": "can change user","codename": "change_user"}]}
   * @paramUse(sortable, filterable)
  */
  public async createPermissions() {
    try {
      const codenames = permissions.map(p => p.codename);
      console.log('Codenames:', codenames);

      // Check for existing permissions
      const existingPermissions = await AppDataSource.manager.find(AuthPermission, {
        where: { codename: In(codenames) }
      });

      const existingCodenames = new Set(existingPermissions.map(p => p.codename));
      const newPermissions = permissions.filter(p => !existingCodenames.has(p.codename));

      if (newPermissions.length > 0) {
        const createdPermissions = newPermissions.map(p => {
          const authPermission = new AuthPermission();
          authPermission.name = p.name;
          authPermission.codename = p.codename;
          return authPermission;
        });

        const savedAuthPermissions = await AppDataSource.manager.save(AuthPermission, createdPermissions);
        console.log('Saved Permissions:', savedAuthPermissions);
        return { status: 201, savedAuthPermissions };
      } else {
        return { status: 200, message: 'No new permissions to add.' };
      }
    } catch (error) {
      console.error('Error creating permissions:', error);
      return { status: 500, message: 'Internal Server Error' };
    }
  }
}

