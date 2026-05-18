import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import type { ChargeStatus } from "../../domain/value-objects/charge-status.vo";

@Entity({ name: "charges" })
export class ChargeOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({ name: "service_order_id", type: "uuid" })
  serviceOrderId: string;

  @Column({ name: "customer_id", type: "varchar", length: 64 })
  customerId: string;

  @Column({ name: "total_cents", type: "int" })
  totalCents: number;

  @Column({
    type: "enum",
    enum: ["PENDING", "APPROVED", "REJECTED", "EXPIRED", "REFUNDED"],
    default: "PENDING",
  })
  status: ChargeStatus;

  @Column({ name: "mp_preference_id", type: "varchar", nullable: true })
  mpPreferenceId: string | null;

  @Column({ name: "mp_payment_id", type: "varchar", nullable: true })
  mpPaymentId: string | null;

  @Column({ name: "checkout_url", type: "varchar", nullable: true })
  checkoutUrl: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
