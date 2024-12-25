import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import * as path from 'path';
import { Observable, tap } from 'rxjs';

@Injectable()
export class UnlinkFileInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap({
        finalize: () => {
          try {
            if (req.files) {
              if (Array.isArray(req.files)) {
                req.files.forEach((file: Express.Multer.File) =>
                  unlink(
                    path.resolve(
                      process.cwd(),
                      `${file.destination}/${file.filename}`,
                    ),
                  ),
                );
              } else {
                Object.values(req.files).forEach(
                  (fileArray: Express.Multer.File[]) => {
                    console.log('File array::', fileArray);
                    fileArray.forEach((file: Express.Multer.File) =>
                      unlink(
                        path.resolve(
                          process.cwd(),
                          `${file.destination}/${file.filename}`,
                        ),
                      ),
                    );
                  },
                );
              }
            }
            if (req.file) {
              unlink(
                path.resolve(
                  process.cwd(),
                  `${req.file.destination}/${req.file.filename}`,
                ),
              );
            }
          } catch (err) {
            Logger.error(err);
          }
        },
      }),
    );
  }
}
