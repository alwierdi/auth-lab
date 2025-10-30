import { Reflector } from '@nestjs/core';

export interface BaseResponse<T> {
  status: number;
  message: string;
  data?: T;
  error?: string | string[];
  timestamp: string;
}

export function createResponse<T>(
  status: number,
  message: string,
  data?: T,
  error?: string | string[],
): BaseResponse<T> {
  return {
    status,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
}

export const ResponseMessage = Reflector.createDecorator<string>();
