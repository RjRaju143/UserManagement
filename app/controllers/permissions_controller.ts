import { inject } from '@adonisjs/core';
import { In } from 'typeorm';
import { AuthPermission, permissions } from "#models/index"
import { AppDataSource } from "#config/database";

@inject()
export default class UserGroupsController {
  constructor() { }

  /**
   * @createPermissions
   * @operationId user
   * @description Creates a new Permissions with specified codes.
   * @responseBody 201 - {"status": 201,"savedAuthPermissions": [{"id": "number","name": "string","codename": "string"}]}
   * @paramUse(sortable, filterable)
  */
  public async userpermissions() {
    try {
      const codenames = permissions.map(p => p.codename);
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

