import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AccountService } from '../../resources/account/account.service';

describe('AuthService', () => {
  let authService: AuthService;
  let accountService: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, AccountService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    accountService = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});
