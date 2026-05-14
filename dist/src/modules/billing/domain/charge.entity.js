"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Charge = void 0;
const openapi = require("@nestjs/swagger");
const business_rule_exception_1 = require("../../../shared/domain/exceptions/business-rule.exception");
class Charge {
    constructor(props) {
        this._id = props.id;
        this._serviceOrderId = props.serviceOrderId;
        this._customerId = props.customerId;
        this._totalCents = props.totalCents;
        this._status = props.status;
        this._mpPreferenceId = props.mpPreferenceId;
        this._mpPaymentId = props.mpPaymentId;
        this._checkoutUrl = props.checkoutUrl;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
    }
    static create(props) {
        if (props.totalCents <= 0) {
            throw new business_rule_exception_1.BusinessRuleException('Charge total must be positive');
        }
        const now = new Date();
        return new Charge({
            ...props,
            status: 'PENDING',
            mpPreferenceId: null,
            mpPaymentId: null,
            checkoutUrl: null,
            createdAt: now,
            updatedAt: now,
        });
    }
    static restore(props) {
        return new Charge(props);
    }
    attachPreference(mpPreferenceId, checkoutUrl) {
        this._mpPreferenceId = mpPreferenceId;
        this._checkoutUrl = checkoutUrl;
        this._updatedAt = new Date();
    }
    approve(mpPaymentId) {
        this.ensurePending('approve');
        this._status = 'APPROVED';
        this._mpPaymentId = mpPaymentId;
        this._updatedAt = new Date();
    }
    reject(mpPaymentId) {
        this.ensurePending('reject');
        this._status = 'REJECTED';
        this._mpPaymentId = mpPaymentId;
        this._updatedAt = new Date();
    }
    expire() {
        this.ensurePending('expire');
        this._status = 'EXPIRED';
        this._updatedAt = new Date();
    }
    refund() {
        if (this._status !== 'APPROVED') {
            throw new business_rule_exception_1.BusinessRuleException(`Cannot refund charge in status ${this._status}`);
        }
        this._status = 'REFUNDED';
        this._updatedAt = new Date();
    }
    ensurePending(action) {
        if (this._status !== 'PENDING') {
            throw new business_rule_exception_1.BusinessRuleException(`Cannot ${action} charge in status ${this._status}`);
        }
    }
    get id() { return this._id; }
    get serviceOrderId() { return this._serviceOrderId; }
    get customerId() { return this._customerId; }
    get totalCents() { return this._totalCents; }
    get status() { return this._status; }
    get mpPreferenceId() { return this._mpPreferenceId; }
    get mpPaymentId() { return this._mpPaymentId; }
    get checkoutUrl() { return this._checkoutUrl; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    static _OPENAPI_METADATA_FACTORY() {
        return { _id: { required: true, type: () => require("./value-objects/charge-id.vo").ChargeId }, _serviceOrderId: { required: true, type: () => String }, _customerId: { required: true, type: () => String }, _totalCents: { required: true, type: () => Number }, _status: { required: true, type: () => Object }, _mpPreferenceId: { required: true, type: () => String, nullable: true }, _mpPaymentId: { required: true, type: () => String, nullable: true }, _checkoutUrl: { required: true, type: () => String, nullable: true }, _createdAt: { required: true, type: () => Date }, _updatedAt: { required: true, type: () => Date } };
    }
}
exports.Charge = Charge;
//# sourceMappingURL=charge.entity.js.map