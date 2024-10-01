import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import { UserService } from '../service/users_service.js';

@inject()
export default class UsersController {
  constructor(private userService: UserService) { }

  public async create({ request, response }: HttpContext) {
    const { username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds } = request.body();
    const result = await this.userService.create(username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds);
    return response.status(result.status).json(result);
  }
}
