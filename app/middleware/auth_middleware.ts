import { jwtConfig } from '#config/jwt';
import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken';
import '@adonisjs/core/http';

declare module '@adonisjs/core/http' {
  interface Request {
    user?: any;
  }
}

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      const authHeader = ctx.request.header('Authorization')
      console.log({ authHeader })
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ctx.response.status(401).send({ error: 'Authorization header is missing or invalid' });
        return; // Stop further processing
      }

      const token = authHeader.replace('Bearer ', '');
      // console.log('Token:', token);
      const user = jwt.verify(token, jwtConfig.jwt.secret)
      console.log({ user })
      if (!user) {
        return ctx.response.status(404).send({ message: "User Not Found", });
      }
      ctx.request.user = user;
      return await next()
    } catch (error) {
      console.log(error)
      return ctx.response.status(500).send({ message: "Internal Server Error", error });
    }
  }
}
