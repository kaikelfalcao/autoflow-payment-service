"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DomainExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const not_found_exception_1 = require("../../domain/exceptions/not-found.exception");
const business_rule_exception_1 = require("../../domain/exceptions/business-rule.exception");
let DomainExceptionFilter = DomainExceptionFilter_1 = class DomainExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(DomainExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof not_found_exception_1.NotFoundException
            ? common_1.HttpStatus.NOT_FOUND
            : common_1.HttpStatus.UNPROCESSABLE_ENTITY;
        this.logger.warn(exception.message);
        response.status(status).json({
            statusCode: status,
            error: exception.name,
            message: exception.message,
        });
    }
};
exports.DomainExceptionFilter = DomainExceptionFilter;
exports.DomainExceptionFilter = DomainExceptionFilter = DomainExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(not_found_exception_1.NotFoundException, business_rule_exception_1.BusinessRuleException)
], DomainExceptionFilter);
//# sourceMappingURL=domain-exception.filter.js.map