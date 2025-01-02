import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { AuthPermission } from '../app/User/models/index.js'
import { AppDataSource } from "#config/database";

export default class Permissions extends BaseCommand {
  static commandName = 'export_permissions'
  static description = 'Export permissions from a Database and save to the JSON file.'

  static options: CommandOptions = {}

  public async run() {
    await AppDataSource.initialize();
    try {
      const permissions = await AppDataSource.manager.find(AuthPermission);
      const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './Data/userpermissions.json');
      const data = JSON.stringify(permissions, null, 2)
      await fs.writeFile(filePath, data);
      this.logger.success(data)
    } catch (error:any) {
      this.logger.error(error);
    }
  }
}



// node ace export_permissions

