import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CloudinaryModule } from "@scwar/nestjs-cloudinary";
import { MediaService } from "./media.service";

@Global()
@Module({
  imports: [
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        cloud_name: configService.get("media.cloudinaryCloudName"),
        api_key: configService.get("media.cloudinaryApiKey"),
        api_secret: configService.get("media.cloudinaryApiSecret"),
        secure: configService.get("media.cloudinarySecure"),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
