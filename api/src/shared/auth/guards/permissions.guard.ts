import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticatedUser } from "../../types";
import { AuthService } from "../auth.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>("permissions", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // Get user with permissions from database
    const userWithPermissions = await this.authService.getUserWithPermissions(user.id);

    if (!userWithPermissions) {
      throw new ForbiddenException("User not found");
    }

    const hasPermission = requiredPermissions.some((permission) =>
      userWithPermissions.hasPermission(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(", ")}`,
      );
    }

    return true;
  }
}
