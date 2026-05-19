# ADR-003 — Webhook idempotente por status da Charge

## Contexto

Mercado Pago entrega webhooks at-least-once. O mesmo `mp_payment_id` pode
chegar 2x (retry após timeout do nosso 200). Sem proteção, a charge seria
aprovada duas vezes — publicaria evento duplicado, contabilidade quebrada.

## Decisão

Verificar o estado atual da Charge antes de transicionar:

```ts
if (charge.status !== 'PENDING') {
  this.logger.log('Charge já processada, ignorando');
  return;
}
charge.approve(mpPaymentId);
```

A entidade `Charge` é uma state machine pura:
- `PENDING → APPROVED` (uma vez)
- `PENDING → REJECTED` (uma vez)
- `APPROVED → REFUNDED` (uma vez)

Toda transição rejeita re-entrada via `ensurePending('approve')` /
`ensurePending('reject')` lançando exceção.

Adicionalmente: cada webhook recebido é gravado na tabela `webhook_events`
para auditoria.

## Consequências

**+** Webhook duplicado é no-op silencioso.
**+** Tentativa de alterar charge inválida (ex: já APPROVED) lança
exception clara.
**+** Histórico completo para investigar disputas com MP.
**−** Não detecta payment_id diferente para mesma order (duas cobranças
distintas). Aceitável: order tem apenas uma charge ativa (índice em
`service_order_id`).
