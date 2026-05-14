"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargeResponseDto = void 0;
const openapi = require("@nestjs/swagger");
class ChargeResponseDto {
    static fromDomain(charge) {
        const dto = new ChargeResponseDto();
        dto.chargeId = charge.id.value;
        dto.serviceOrderId = charge.serviceOrderId;
        dto.customerId = charge.customerId;
        dto.totalCents = charge.totalCents;
        dto.status = charge.status;
        dto.checkoutUrl = charge.checkoutUrl;
        dto.mpPreferenceId = charge.mpPreferenceId;
        dto.mpPaymentId = charge.mpPaymentId;
        dto.createdAt = charge.createdAt;
        dto.updatedAt = charge.updatedAt;
        return dto;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { chargeId: { required: true, type: () => String }, serviceOrderId: { required: true, type: () => String }, customerId: { required: true, type: () => String }, totalCents: { required: true, type: () => Number }, status: { required: true, type: () => String }, checkoutUrl: { required: true, type: () => String, nullable: true }, mpPreferenceId: { required: true, type: () => String, nullable: true }, mpPaymentId: { required: true, type: () => String, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.ChargeResponseDto = ChargeResponseDto;
//# sourceMappingURL=charge-response.dto.js.map