import { Test, TestingModule } from '@nestjs/testing';
import { AuthGoogleController } from './auth-google.controller';
import { AccountService } from '../../resources/account/account.service';
import { AuthService } from '../auth/auth.service';

describe('AuthGoogleController', () => {
  let controller: AuthGoogleController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthGoogleController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthGoogleController>(AuthGoogleController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
