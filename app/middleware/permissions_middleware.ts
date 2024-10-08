import { AppDataSource } from '#config/database'
import { AuthGroupPermissions, UserGroup } from '#models/index'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

declare module '@adonisjs/core/http' {
  interface Request {
    userPermissions?: any;
  }
}

export default class PermissionsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      const user = ctx.request.user
      if (user.isSuperuser) {
        console.log(`You are SuperUser 👻 ${user.username}`)
        return await next()
      }

      if (!user.isSuperuser) {
        console.log(`You are USER 🙎 ${user.username}`)
        const userGroups = await AppDataSource.manager.find(UserGroup, { where: { user: { id: user.id } } });
        const userPermissions = await AppDataSource.manager.find(AuthGroupPermissions, {
          where: { group: { id: userGroups[0].group.id } },
          relations: ['group']
        });

        const codes = userPermissions.map(p => p.permission?.codename);

        ctx.request.userPermissions = codes;
        return await next()
      }
    } catch (error) {
      console.error(error)
      return ctx.response.status(500).json({ status: 500, message: "Internal server error" })
    }
    return ctx.response.status(403).json({ status: 403, message: "Forbidden" })
  }
}
