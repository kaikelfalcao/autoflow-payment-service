import { BusinessRuleException } from "@/shared/domain/exceptions/business-rule.exception";
import type { ChargeId } from "./value-objects/charge-id.vo";
import type { ChargeStatus } from "./value-objects/charge-status.vo";

export interface ChargeProps {
  id: ChargeId;
  serviceOrderId: string;
  customerId: string;
  totalCents: number;
  status: ChargeStatus;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  checkoutUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChargeProps {
  id: ChargeId;
  serviceOrderId: string;
  customerId: string;
  totalCents: number;
}

export class Charge {
  private readonly _id: ChargeId;
  private readonly _serviceOrderId: string;
  private readonly _customerId: string;
  private readonly _totalCents: number;
  private _status: ChargeStatus;
  private _mpPreferenceId: string | null;
  private _mpPaymentId: string | null;
  private _checkoutUrl: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ChargeProps) {
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

  static create(props: CreateChargeProps): Charge {
    if (props.totalCents <= 0) {
      throw new BusinessRuleException("Charge total must be positive");
    }
    const now = new Date();
    return new Charge({
      ...props,
      status: "PENDING",
      mpPreferenceId: null,
      mpPaymentId: null,
      checkoutUrl: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ChargeProps): Charge {
    return new Charge(props);
  }

  attachPreference(mpPreferenceId: string, checkoutUrl: string): void {
    this._mpPreferenceId = mpPreferenceId;
    this._checkoutUrl = checkoutUrl;
    this._updatedAt = new Date();
  }

  approve(mpPaymentId: string): void {
    this.ensurePending("approve");
    this._status = "APPROVED";
    this._mpPaymentId = mpPaymentId;
    this._updatedAt = new Date();
  }

  reject(mpPaymentId: string): void {
    this.ensurePending("reject");
    this._status = "REJECTED";
    this._mpPaymentId = mpPaymentId;
    this._updatedAt = new Date();
  }

  expire(): void {
    this.ensurePending("expire");
    this._status = "EXPIRED";
    this._updatedAt = new Date();
  }

  refund(): void {
    if (this._status !== "APPROVED") {
      throw new BusinessRuleException(
        `Cannot refund charge in status ${this._status}`,
      );
    }
    this._status = "REFUNDED";
    this._updatedAt = new Date();
  }

  private ensurePending(action: string): void {
    if (this._status !== "PENDING") {
      throw new BusinessRuleException(
        `Cannot ${action} charge in status ${this._status}`,
      );
    }
  }

  get id(): ChargeId {
    return this._id;
  }
  get serviceOrderId(): string {
    return this._serviceOrderId;
  }
  get customerId(): string {
    return this._customerId;
  }
  get totalCents(): number {
    return this._totalCents;
  }
  get status(): ChargeStatus {
    return this._status;
  }
  get mpPreferenceId(): string | null {
    return this._mpPreferenceId;
  }
  get mpPaymentId(): string | null {
    return this._mpPaymentId;
  }
  get checkoutUrl(): string | null {
    return this._checkoutUrl;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
