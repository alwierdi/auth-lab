import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { BaseResponse, createResponse, ResponseMessage } from './base-response';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BaseResponseInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode: number = response.statusCode;

        let message = 'Success';
        let responseData = data;

        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;

          // Hapus 'message' dari data untuk avoid duplikasi
          const { message: _, ...rest } = data;

          responseData = Object.keys(rest).length > 0 ? rest : null;
        } else {
          const decoratorMessage = this.reflector.get<string>(
            ResponseMessage,
            context.getHandler(),
          );

          if (decoratorMessage) {
            message = decoratorMessage;
          }
        }

        return createResponse(statusCode, message, responseData);
      }),
    );
  }
}
