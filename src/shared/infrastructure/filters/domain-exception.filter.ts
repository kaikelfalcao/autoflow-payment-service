import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { BusinessRuleException } from '../../domain/exceptions/business-rule.exception';

@Catch(NotFoundException, BusinessRuleException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof NotFoundException
        ? HttpStatus.NOT_FOUND
        : HttpStatus.UNPROCESSABLE_ENTITY;

    this.logger.warn(exception.message);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
