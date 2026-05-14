import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class DomainExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: Error, host: ArgumentsHost): void;
}
