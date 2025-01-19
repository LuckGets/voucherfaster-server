import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AccountService } from '@resources/account/account.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { HttpRequestWithUser } from 'src/common/http.type';

@Injectable()
export class VerifiedAccountGuard implements CanActivate {
  private readonly logger = new Logger(VerifiedAccountGuard.name);
  constructor(private accountService: AccountService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user }: HttpRequestWithUser = context.switchToHttp().getRequest();
    try {
      const account = await this.accountService.findById(user.accountId);

      if (!account) throw ErrorApiResponse.unauthorizedRequest();
      if (!account.verifiedAt || account.verifiedAt > new Date())
        throw ErrorApiResponse.unauthorizedRequest(
          `The account ID: ${account.id} is unverified account. Please verify your account before making a request.`,
        );

      return true;
    } catch (err) {
      this.logger.error(
        `Request could not be proceed due to the Error : ${err.message}`,
      );
      throw ErrorApiResponse.unauthorizedRequest(err.message);
    }
  }
}
