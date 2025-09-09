import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MonnifyModule } from "@scwar/nestjs-monnify";
import { PaymentsService } from "./payments.service";

@Global()
@Module({
  imports: [
    MonnifyModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secretKey: configService.get("monnify.secretKey"),
        publicKey: configService.get("monnify.publicKey"),
        contractCode: configService.get("monnify.contractCode"),
        applicationEnvironment: configService.get("monnify.applicationEnvironment"),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
