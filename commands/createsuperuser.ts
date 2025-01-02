import type { CommandOptions } from '@adonisjs/core/types/ace'
import { BaseCommand } from '@adonisjs/core/ace'
import { AppDataSource } from '#config/database'
import { AuthUser } from '../app/User/models/index.js'
import { hashPassword } from "../app/helper/hashpassword.js"

export default class Createsuperuser extends BaseCommand {
  static commandName = 'createsuperuser'
  static options: CommandOptions = {}
  async run() {
    try {
      await AppDataSource.initialize();
    } catch (err) {
      console.error('Database connection failed:', err);
      return;
    }

    const username = await this.prompt.ask('Enter the username')
    const password = await this.prompt.ask('Enter the password')
    const email = await this.prompt.ask('Enter the email')
    const phone = await this.prompt.ask('Enter the phone') as number
    const firstname = await this.prompt.ask('Enter the firstname')
    const lastname = await this.prompt.ask('Enter the lastname')

    try {
      const { salt, hashedPassword } = await hashPassword(password);
      const user = AppDataSource.manager.create(AuthUser, {
        username,
        password: hashedPassword,
        salt,
        email,
        phone,
        firstname,
        lastname,
        isAdmin: true,
        isSuperuser: true
      });
      await AppDataSource.manager.save(user);
      console.log('SuperUser created successfully!');
    } catch (error: any) {
      this.logger.error(error);
    }
  }
}
