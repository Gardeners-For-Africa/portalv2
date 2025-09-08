import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, query, params } = request;
    const userAgent = request.get("User-Agent") || "";
    const ip = request.ip;

    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`);

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    if (query && Object.keys(query).length > 0) {
      this.logger.debug(`Query Params: ${JSON.stringify(query)}`);
    }

    if (params && Object.keys(params).length > 0) {
      this.logger.debug(`Route Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `Outgoing Response: ${method} ${url} - ${response.statusCode} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Request Error: ${method} ${url} - ${error.status || 500} - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
