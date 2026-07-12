import { FastifyInstance } from "fastify";

import { UserRepository } from "../modules/user/user.repository";
import { LoginService } from "../modules/auth/services/login.service";
import { FastifyTokenService } from "../modules/auth/services/token.service";
import { SessionRepository } from "../modules/session/session.repository";
import { SessionService } from "../modules/session/session.service";
import { RefreshTokenService } from "../modules/auth/services/refresh-token.service";
import { LogoutService } from "../modules/auth/services/logout.service";

export class Container {
  public readonly userRepository: UserRepository;
  public readonly tokenService: FastifyTokenService;
  public readonly loginService: LoginService;
  public readonly sessionRepository: SessionRepository;
  public readonly sessionService: SessionService;
  public readonly refreshTokenService: RefreshTokenService;
  public readonly logoutService: LogoutService;


  constructor(app: FastifyInstance) {
    this.userRepository = new UserRepository();

    this.tokenService = new FastifyTokenService(app);
    
    this.sessionRepository = new SessionRepository();

    this.sessionService = new SessionService(
      this.sessionRepository
    );

    this.loginService = new LoginService(
      this.userRepository,
      this.sessionService,
      this.tokenService
    );

    this.refreshTokenService = new RefreshTokenService(
      this.sessionService,
      this.tokenService
    );

    this.logoutService = new LogoutService(
      this.sessionService,
      this.tokenService
    );
  }
}