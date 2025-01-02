import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { AppDataSource } from "#config/database";

export default class Migrate extends BaseCommand {
  static commandName = 'migrate'
  static options: CommandOptions = {}
  public async run() {
    await AppDataSource.initialize()
    await AppDataSource.synchronize(true)
    this.logger.success("migrations")
  }
}


// node ace migrate
