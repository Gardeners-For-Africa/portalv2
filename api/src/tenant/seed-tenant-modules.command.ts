import { Command, CommandRunner } from "nest-commander";
import { TenantModuleSeederService } from "./tenant-module-seeder.service";

@Command({
  name: "seed-tenant-modules",
  description: "Seed system tenant modules",
})
export class SeedTenantModulesCommand extends CommandRunner {
  constructor(private readonly tenantModuleSeederService: TenantModuleSeederService) {
    super();
  }

  async run(): Promise<void> {
    console.log("Starting tenant modules seeding...");

    try {
      await this.tenantModuleSeederService.seedSystemModules();
      const count = await this.tenantModuleSeederService.getSystemModulesCount();
      console.log(`✅ Successfully seeded ${count} system modules`);
    } catch (error) {
      console.error("❌ Error seeding tenant modules:", error.message);
      process.exit(1);
    }
  }
}
