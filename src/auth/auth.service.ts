import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Payload } from './jwt.payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async generateJwt(user: any): Promise<string> {
    const payload:Payload = { googleId: user.googleId, name: user.name, email: user.email };
    return this.jwtService.sign(payload);
  }

  async validateGoogleUser(profile: any): Promise<any> {
    const { id, displayName, emails } = profile;
    const email = emails && emails[0] ? emails[0].value : null;

    const user = {
      googleId: id,
      name: displayName,
      email: email,
    };


    return user;
  }
}