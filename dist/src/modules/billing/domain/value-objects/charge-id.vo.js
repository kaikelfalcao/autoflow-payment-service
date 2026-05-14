"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargeId = void 0;
const uuid_1 = require("uuid");
class ChargeId {
    constructor(value) {
        this.value = value;
    }
    static generate() {
        return new ChargeId((0, uuid_1.v4)());
    }
    static fromString(id) {
        return new ChargeId(id);
    }
    toString() {
        return this.value;
    }
}
exports.ChargeId = ChargeId;
//# sourceMappingURL=charge-id.vo.js.map