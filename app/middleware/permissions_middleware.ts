import { AppDataSource } from '#config/database'
import { UserPermissions, UserResponce } from '../interfaces/index.js'
import { AuthGroupPermissions, UserGroup } from '../User/models/index.js'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

declare module '@adonisjs/core/http' {
  interface Request {
    userPermissions: UserPermissions
  }
}

export default class PermissionsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      const user = ctx.request.user as UserResponce
      if (user.isSuperuser) {
        console.log(`You are SuperUser 👻 ${user.username}`)
        return await next()
      }

      if (!user.isSuperuser) {
        console.log(`You are USER 🙎 ${user.username}, Admin: ${user.isAdmin}`)
        const userGroups = await AppDataSource.manager.find(UserGroup, {
          where: { user: { id: user.id } },
        })

        if (userGroups.length === 0) {
          return ctx.response.status(403).json({
            status: 403,
            message: 'User is not part of any group',
          })
        }

        const userPermissions = await AppDataSource.manager.find(AuthGroupPermissions, {
          where: { group: { id: userGroups[0].group.id } },
          relations: ['group'],
        })
        ctx.request.userPermissions = userPermissions.map(
          (p) => p.permission?.code
        ) as UserPermissions
        return await next()
      }
    } catch (error: unknown) {
      console.error(error)
      return ctx.response.status(500).json({ status: 500, message: 'Internal server error' })
    }
    return ctx.response.status(403).json({ status: 403, message: 'Forbidden' })
  }
}
