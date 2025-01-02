import { In } from 'typeorm';
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { AuthPermission } from '../app/User/models/index.js'
import { AppDataSource } from "#config/database";

export default class Permissions extends BaseCommand {
  static commandName = 'import_permissions'
  static description = 'Import permissions from a JSON file and save to the database.'

  static options: CommandOptions = {}

  public async loadPermissions() {
    try {
      const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './Data/userpermissions.json')
      const fileData = await fs.readFile(filePath, 'utf-8')
      const permissions = JSON.parse(fileData)
      return permissions
    } catch (error) {
      console.error('Error loading permissions:', error)
      throw error
    }
  }

  public async run() {
    await AppDataSource.initialize()
    try {
      const permissions = await this.loadPermissions()
      if (!permissions || permissions.length === 0) {
        console.log('No permissions found in the JSON file.')
        return
      }

      const codenames = permissions.map((p: { code: string }) => p.code)

      const existingPermissions = await AppDataSource.manager.find(AuthPermission, {
        where: { code: In(codenames) },
      })

      const existingCodenames = new Set(existingPermissions.map(p => p.code))

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
        this.logger.success(JSON.stringify(savedAuthPermissions, null, 2))
      } else {
        this.logger.info('No new permissions to add.')
      }
    } catch (error:any) {
      this.logger.error(error)
    }
  }
}



// node ace import_permissions
