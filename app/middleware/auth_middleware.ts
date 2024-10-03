import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const authHeader = ctx.request.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.response.status(401).send({ error: 'Authorization header is missing or invalid' });
      return; // Stop further processing
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token);
    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
