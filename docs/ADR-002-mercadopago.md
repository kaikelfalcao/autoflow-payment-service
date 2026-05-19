# ADR-002 — Port para Mercado Pago + adapter real ou mock

## Contexto

- Em prod: integrar com Mercado Pago real (criar preference, validar webhook,
  consultar status).
- Em dev/CI: não queremos chamar MP. Precisamos simular.

## Decisão

- `IMercadoPagoPort` (em `domain/ports/`): interface com `createPreference`,
  `getPayment`.
- Dois adapters em `infrastructure/mercado-pago/`:
  - `MercadoPagoAdapter` — usa SDK real `mercadopago`
  - `MercadoPagoMockAdapter` — estado em `Map` in-memory; `setStatus` ajusta
    o status visível para `getPayment`
- DI factory escolhe o adapter via env `MP_MOCK`:
  ```ts
  useFactory: (config) => config.get('MP_MOCK') === 'true' ? mockAdapter : new MercadoPagoAdapter(config)
  ```

## Consequências

**+** Use-cases não sabem qual adapter está plugado — domínio limpo.
**+** Testes BDD usam o port direto, sem depender de SDK.
**−** Mock in-memory **não persiste** state entre restarts/pods → ver
ADR-003 (idempotência) e o workaround `replicas: 1` em dev.
