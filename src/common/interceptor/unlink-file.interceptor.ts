import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { unlink } from 'fs/promises';
import { Observable, tap } from 'rxjs';

@Injectable()
export class UnlinkFileInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap({
        finalize: async () => {
          try {
            const unlinkPromises: Promise<void>[] = [];

            // Helper function to enqueue unlink operations
            const enqueueUnlink = (filePath?: string) => {
              if (filePath && typeof filePath === 'string') {
                unlinkPromises.push(unlink(filePath));
              }
            };

            if (req.files) {
              if (Array.isArray(req.files)) {
                req.files.forEach((file: Express.Multer.File) =>
                  enqueueUnlink(file.path),
                );
              } else {
                Object.values(req.files).forEach(
                  (fileArray: Express.Multer.File[]) => {
                    fileArray.forEach((file: Express.Multer.File) =>
                      enqueueUnlink(file.path),
                    );
                  },
                );
              }
            }
            if (req.file) {
              enqueueUnlink(req.file.path);
            }

            if (unlinkPromises.length > 0) {
              await Promise.all(unlinkPromises);
            }
          } catch (err) {
            Logger.error(err);
          }
        },
      }),
    );
  }
}
