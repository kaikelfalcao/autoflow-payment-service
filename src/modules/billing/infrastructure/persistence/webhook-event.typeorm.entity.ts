import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'webhook_events' })
export class WebhookEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'charge_id', type: 'uuid' })
  chargeId: string;

  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Index()
  @Column({ name: 'mp_payment_id', type: 'varchar' })
  mpPaymentId: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ name: 'raw_payload', type: 'jsonb' })
  rawPayload: Record<string, unknown>;

  @CreateDateColumn({ name: 'processed_at' })
  processedAt: Date;
}
