# ADR-001 — DDD por bounded context (módulo billing único)

## Contexto

`payment-service` tem um único bounded context: cobrança/billing. Não há
sub-domínios independentes como em `order-service`.

## Decisão

Mesma estrutura do `order-service` (DDD modular) mas com **um único módulo**
`billing`:

```
src/modules/billing/
├── application/     # use-cases (CreateCharge, ProcessWebhook, GetCharge)
├── domain/          # Charge entity, ports (MercadoPagoPort, EventPublisher, ChargeRepository)
├── infrastructure/  # adapters TypeORM, MP real/mock, RabbitMQ
└── presentation/    # controllers HTTP

src/shared/
├── domain/          # exceptions compartilhadas
└── infrastructure/  # config, filters, health
```

## Consequências

**+** Consistência arquitetural com `order-service` — mesmo dev navega ambos.
**+** Use-cases nomeados explicitam intenção (`CreateChargeUseCase`,
`ProcessWebhookUseCase`).
**+** Adapters via ports permite trocar MP real por mock sem mexer no domínio
(usado em dev local).
**−** Mais arquivos vs MVC simples. Justificado pela densidade de regras
(idempotência, state machine de Charge).
