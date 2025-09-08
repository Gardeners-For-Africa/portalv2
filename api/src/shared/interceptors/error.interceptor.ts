import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from "@nestjs/common";
import { type Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Log the error
        this.logger.error(
          `Error in ${context.getClass().name}.${context.getHandler().name}: ${error.message}`,
          error.stack,
        );

        // Re-throw the error to be handled by the exception filter
        return throwError(() => error);
      }),
    );
  }
}
