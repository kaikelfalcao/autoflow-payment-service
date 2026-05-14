"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleException = void 0;
class BusinessRuleException extends Error {
    constructor(message) {
        super(message);
        this.name = 'BusinessRuleException';
    }
}
exports.BusinessRuleException = BusinessRuleException;
//# sourceMappingURL=business-rule.exception.js.map