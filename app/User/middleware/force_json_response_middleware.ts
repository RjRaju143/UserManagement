import { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import { Logger } from '@adonisjs/core/logger'

/**
 * Middleware to enforce JSON response and bind context values.
 */
export default class CombinedMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.request.headers().accept = 'application/json';
    ctx.containerResolver.bindValue(HttpContext, ctx);
    ctx.containerResolver.bindValue(Logger, ctx.logger);
    ctx.logger.info(`${ctx.request.protocol()}, ${ctx.request.ip()}, ${ctx.request.method()}, ${ctx.response.getStatus()}, ${ctx.request.parsedUrl.href}`);
    return next();
  }
}
