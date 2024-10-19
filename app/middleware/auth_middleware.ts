import { jwtConfig } from '#config/jwt';
import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt, { JwtPayload } from 'jsonwebtoken';
import '@adonisjs/core/http';
import { AppDataSource } from '#config/database';
import { AuthUser } from '#models/AuthUser';
import { User } from '#interfaces/index';

declare module '@adonisjs/core/http' {
  interface Request {
    user: User;
  }
}

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      const authHeader = ctx.request.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.response.status(401).send({ error: 'Authorization header is missing or invalid' });
      }

      const token = authHeader.replace('Bearer ', '');
      const userId = jwt.verify(token, jwtConfig.jwt.secret) as JwtPayload;
      if (!userId.id) {
        return ctx.response.status(404).send({ message: "User Not Found" });
      }

      const userdata = await AppDataSource.manager.find(AuthUser, { where: { id: userId.id } });
      if (!userdata) {
        return ctx.response.status(404).send({ message: "User Not Found" });
      }

      ctx.request.user = userdata[0];
      return await next();
    } catch (error: unknown) {
      console.error(error);
      return ctx.response.status(500).send({ message: "Internal Server Error", error });
    }
  }
}
