import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";
import { AuthService } from "../auth.service";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>("FACEBOOK_APP_ID"),
      clientSecret: configService.getOrThrow<string>("FACEBOOK_APP_SECRET"),
      callbackURL: configService.getOrThrow<string>("FACEBOOK_CALLBACK_URL"),
      profileFields: ["id", "emails", "name", "picture"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: any,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const user = {
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      avatar: photos?.[0]?.value,
      ssoProvider: "facebook",
      ssoId: profile.id,
    };

    done(null, user);
  }
}
