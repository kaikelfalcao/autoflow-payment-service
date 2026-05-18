# autoflow-payment-service

> Microsserviço de **cobranças e integração com Mercado Pago** do ecossistema **autoflow** (FIAP Tech Challenge — Fase 4).

Responsável por:

- Criar uma `Charge` quando o `order-service` publica `order.payment.requested`.
- Gerar a preferência de pagamento (real ou mock) no Mercado Pago.
- Processar webhooks de pagamento (`/billing/webhook/mercadopago`) e atualizar o status da `Charge`.
- Publicar o resultado em `payment.events` (`payment.confirmed` / `payment.failed` / `payment.refunded`).
- Expor endpoints mock para simular aprovação/rejeição em ambientes locais.

---

## 🧱 Stack

| Camada       | Tecnologia                                |
|--------------|-------------------------------------------|
| Runtime      | Node.js 24 (LTS)                          |
| Linguagem    | TypeScript (strict)                       |
| Framework    | NestJS 11                                 |
| Banco        | PostgreSQL 16 (TypeORM + migrations)      |
| Mensageria   | RabbitMQ (`amqp-connection-manager`)      |
| Pagamento    | `mercadopago` SDK + adapter mock          |
| Observ.      | New Relic APM + canonical logs (Winston)  |
| Testes       | Jest + Cucumber (BDD)                     |
| Container    | Docker multi-stage                        |
| Deploy       | EKS via GitHub Actions                    |

---

## 🏛️ Arquitetura

**Modular hexagonal** por feature. O módulo `billing/` segue `domain → application → infrastructure → presentation`.

```
src/
├── modules/
│   └── billing/
│       ├── domain/
│       │   ├── charge.entity.ts          ← agregado (status: PENDING|APPROVED|REJECTED|EXPIRED|REFUNDED)
│       │   ├── charge.repository.ts      ← port
│       │   ├── ports/
│       │   │   ├── mercado-pago.port.ts
│       │   │   └── event-publisher.port.ts
│       │   └── value-objects/
│       │       ├── charge-id.vo.ts
│       │       └── charge-status.vo.ts
│       ├── application/use-cases/
│       │   ├── create-charge/            ← idempotente por serviceOrderId
│       │   ├── get-charge/
│       │   └── process-webhook/          ← persiste WebhookEvent + transiciona Charge
│       ├── infrastructure/
│       │   ├── mercado-pago/             ← MercadoPagoAdapter + MercadoPagoMockAdapter
│       │   ├── messaging/                ← payment-requested-consumer + billing-event-publisher
│       │   └── persistence/              ← TypeORM entities, mapper, repos + migrations
│       └── presentation/http/            ← Charge/Webhook/MockPayment controllers + DTOs
├── infrastructure/
│   └── messaging/                        ← EventPublisherService base (RMQ connection wrapper)
├── shared/
│   ├── domain/exceptions/                ← BusinessRule, NotFound
│   ├── filters/                          ← HttpExceptionFilter
│   ├── infrastructure/
│   │   ├── config/                       ← env schema (Joi)
│   │   └── health/                       ← HealthController + Terminus
│   ├── logger/, middlewares/, observability/
└── data-source.ts                        ← TypeORM datasource standalone (migrations CLI)
```

---

## 🌐 Endpoints REST (via Kong)

### Charges — `/billing/charges/*`
| Método | Path                                       | Descrição                                  |
|--------|--------------------------------------------|--------------------------------------------|
| GET    | `/billing/charges/:chargeId`               | Detalhe da charge                          |
| GET    | `/billing/charges/order/:serviceOrderId`   | Charge associada a uma OS                  |

### Webhook — `/billing/webhook/*`
| Método | Path                                       | Descrição                                  |
|--------|--------------------------------------------|--------------------------------------------|
| POST   | `/billing/webhook/mercadopago`             | Webhook do MP — chamado pelo MP (sem JWT)  |

### Mock (apenas em ambientes não-produção) — `/billing/mock/*`
| Método | Path                                       | Descrição                                  |
|--------|--------------------------------------------|--------------------------------------------|
| POST   | `/billing/mock/approve/:mpPaymentId`       | Aprova um pagamento mock                   |
| POST   | `/billing/mock/reject/:mpPaymentId`        | Rejeita um pagamento mock                  |
| POST   | `/billing/mock/simulate-webhook`           | Simula chamada de webhook do MP            |

### Health
- `GET /health` (Postgres + service status)
- `GET /billing/health/liveness` / `GET /billing/health/readiness` (Terminus)

Swagger em `/api/docs`.

---

## 📬 Eventos RabbitMQ

### Consumidos — `order.events` (topic)

| Queue                              | Binding (routing key)        | Efeito                                  |
|------------------------------------|------------------------------|-----------------------------------------|
| `billing.payment.requested`        | `order.payment.requested`    | Cria `Charge` via `CreateChargeUseCase` |

### Publicados — `payment.events` (topic)

| Routing key            | Origem (event.type interno)          | Quando                            |
|------------------------|--------------------------------------|-----------------------------------|
| `payment.confirmed`    | `payment.approved`                   | Webhook MP → status approved      |
| `payment.failed`       | `payment.rejected`                   | Webhook MP → status rejected      |
| `payment.refunded`     | `payment.refunded`                   | Refund manual                     |

Payload: `{ orderId, reason? }`. `reason` é incluído apenas em falhas.

---

## ⚠️ Limitações conhecidas

- **MercadoPagoMockAdapter** mantém estado em memória (Map de pagamentos). Em modo mock, o serviço **deve rodar com replicas=1** (HPA disabled) — múltiplas instâncias quebram a referência ao pagamento mock criado em outra réplica. Em produção (adapter real do MP), não há essa restrição.
- Sem migrations para usuário de dev — banco é provisionado pelo `autoflow-infra/scripts/aws-lab-deploy.sh` ou `local/bootstrap.sh`.

---

## 🔧 Variáveis de ambiente

| Variável                   | Default                                   | Descrição                                |
|----------------------------|-------------------------------------------|------------------------------------------|
| `PORT`                     | `3004`                                    | porta HTTP                                |
| `NODE_ENV`                 | `development`                             | `production` ativa o adapter real do MP   |
| `DATABASE_HOST` …          | (idem outros serviços)                    | conexão Postgres                          |
| `RABBITMQ_URL`             | `amqp://localhost:5672`                   | conexão RMQ                               |
| `MP_ACCESS_TOKEN`          | —                                         | token do Mercado Pago (real ou sandbox)   |
| `MP_NOTIFICATION_URL`      | —                                         | URL pública do webhook (MP chama de fora) |
| `NEW_RELIC_LICENSE_KEY`    | —                                         | (opcional) APM                            |

Validação Joi via `env.schema.ts` — app não sobe sem as obrigatórias.

---

## 🚀 Rodar localmente

```bash
npm install
docker compose up -d        # Postgres + RabbitMQ
npm run migration:run
npm run start:dev
```

Em modo mock (`NODE_ENV != production`), o `MercadoPagoMockAdapter` é injetado e os endpoints `/billing/mock/*` ficam ativos.

Integração completa: `cd ../autoflow-infra/local && ./bootstrap.sh`.

---

## 🧪 Testes

```bash
npm run test           # unit
npm run test:cov       # threshold 80% global
npm run test:bdd       # Cucumber (features/)
npm run lint           # ESLint
npm run format:check   # Prettier
```

**Coverage atual:** **92.71 / 82.29 / 90.10 / 92.68** (statements / branches / functions / lines).

> **TODO:** SonarQube Community.

---

## 🐳 Docker / ☸️ Deploy

| Workflow | Trigger                          | Jobs                              |
|----------|----------------------------------|-----------------------------------|
| `ci.yml` | push/PR em qualquer branch       | lint + format:check + test:cov + bdd |
| `cd.yml` | `workflow_run` (CI ok em `main`) | DockerHub + EKS rollout           |

Imagem: `kaikelfalcao/autoflow-payment:<sha>`. Cluster `autoflow-dev-eks` / namespace `autoflow`.

Migrations executadas via Job no k8s (`k8s/migration-job.yaml`) antes do rollout do Deployment.

---

## 📊 Observabilidade

- Logs canônicos por request HTTP, por evento RMQ e por interação com o SDK do MP.
- WebhookEvent persistido em tabela própria (audit log) antes de transicionar a Charge.
- Custom events no New Relic: `ChargeCreated`, `PaymentApproved`, `PaymentRejected`, `WebhookReceived`.

---

## 🔗 Ecossistema

[`autoflow-infra`](https://github.com/kaikelfalcao/autoflow-infra) · [`autoflow-identity-service`](https://github.com/kaikelfalcao/autoflow-identity-service) · [`autoflow-order-service`](https://github.com/kaikelfalcao/autoflow-order-service) · [`autoflow-catalog-service`](https://github.com/kaikelfalcao/autoflow-catalog-service) · [`autoflow-saga-orchestrator`](https://github.com/kaikelfalcao/autoflow-saga-orchestrator) · [`autoflow-notification-service`](https://github.com/kaikelfalcao/autoflow-notification-service)
