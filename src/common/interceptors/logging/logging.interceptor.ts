import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable, tap } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;

    return next.handle().pipe(
      tap((data) => {
        this.logger.info(
          `[${className}.${handlerName}] Execution time: ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
