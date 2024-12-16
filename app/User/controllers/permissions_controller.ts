import { inject } from '@adonisjs/core'
import { In } from 'typeorm'
import { AuthPermission /*permissions*/ } from '../models/index.js'
import { loadPermissions } from '../helper/users.helpers.js'
import { AppDataSource } from '#config/database'

@inject()
export default class UserGroupsController {
  constructor() {}

  /**
   * @createUserPermissions
   * @operationId user
   * @description Creates a new Permissions with specified codes.
   * @responseBody 201 - {"status": 201,"savedAuthPermissions": [{"id": "number","name": "string","codename": "string"}]}
   * @paramUse(sortable, filterable)
   */
  public async createUserPermissions() {
    try {
      const permissions = await loadPermissions()
      const codenames = permissions.map((p: { code: string }) => p.code)
      const existingPermissions = await AppDataSource.manager.find(AuthPermission, {
        where: { code: In(codenames) },
      })

      const existingCodenames = new Set(existingPermissions.map((p: { code: string }) => p.code))
      const newPermissions = permissions.filter(
        (p: { code: string }) => !existingCodenames.has(p.code)
      )

      if (newPermissions.length > 0) {
        const createdPermissions = newPermissions.map((p: { name: string; code: string }) => {
          const authPermission = new AuthPermission()
          authPermission.name = p.name
          authPermission.code = p.code
          return authPermission
        })

        const savedAuthPermissions = await AppDataSource.manager.save(
          AuthPermission,
          createdPermissions
        )
        return { status: 201, savedAuthPermissions }
      } else {
        return { status: 200, message: 'No new permissions to add.' }
      }
    } catch (error) {
      console.error('Error creating permissions:', error)
      return { status: 500, message: 'Internal Server Error' }
    }
  }

  /**
   * @getUserPermissions
   * @operationId user
   * @description Creates a new Permissions with specified codes.
   * @responseBody 201 - {"status": 201,"savedAuthPermissions": [{"id": "number","name": "string","codename": "string"}]}
   * @paramUse(sortable, filterable)
   */
  public async getUserPermissions() {
    try {
      const userPermissions = await AppDataSource.manager.find(AuthPermission)
      return { status: 201, userPermissions }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      return { status: 500, message: 'Internal Server Error' }
    }
  }
}
