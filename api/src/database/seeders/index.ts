import { DataSource } from "typeorm";
import { PermissionsSeeder } from "./permissions.seeder";
import { RolePermissionsSeeder } from "./role-permissions.seeder";
import { RolesSeeder } from "./roles.seeder";
import { SuperadminSeeder } from "./superadmin.seeder";

export class DatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log("Starting database seeding...");

    try {
      // Run seeders in order
      console.log("1. Seeding permissions...");
      const permissionsSeeder = new PermissionsSeeder(this.dataSource);
      await permissionsSeeder.run();

      console.log("2. Seeding superadmins (creates system tenant)...");
      const superadminSeeder = new SuperadminSeeder(this.dataSource);
      await superadminSeeder.run();

      console.log("3. Seeding roles...");
      const rolesSeeder = new RolesSeeder(this.dataSource);
      await rolesSeeder.run();

      console.log("4. Syncing roles with permissions...");
      const rolePermissionsSeeder = new RolePermissionsSeeder(this.dataSource);
      await rolePermissionsSeeder.run();

      console.log("Database seeding completed successfully!");
    } catch (error) {
      console.error("Error during database seeding:", error);
      throw error;
    }
  }
}

export { PermissionsSeeder } from "./permissions.seeder";
export { RolePermissionsSeeder } from "./role-permissions.seeder";
export { RolesSeeder } from "./roles.seeder";
export { SuperadminSeeder } from "./superadmin.seeder";
