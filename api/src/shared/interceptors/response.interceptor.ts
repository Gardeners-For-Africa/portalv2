import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";
import type { ApiResponse } from "../types";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the response is already formatted as ApiResponse, return it as is
        if (data && typeof data === "object" && data !== null && "success" in data) {
          return data;
        }

        // Otherwise, wrap the response in the standard format
        return {
          success: true,
          message: "Request successful",
          data: data || null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
