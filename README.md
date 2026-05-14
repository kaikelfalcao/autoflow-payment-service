# Billing Service

Microsservico responsavel pelo ciclo de vida de cobranças, integração com Mercado Pago e notificação de resultado de pagamento.

## Arquitetura

- Estilo: microsservicos com comunicacao sincrona (REST) e assincrona (RabbitMQ).
- Banco: PostgreSQL.
- Mensageria: RabbitMQ com topico `payment.events` para publicacao e `order.events` para consumo.

## Responsabilidades

- Consumir evento de pagamento solicitado pelo order-service e criar cobrança no Mercado Pago.
- Receber webhooks do Mercado Pago e processar resultado do pagamento.
- Publicar eventos de resultado de pagamento para o order-service.
- Registrar log de webhooks recebidos.

## Ciclo de vida da cobrança

`PENDING -> APPROVED | REJECTED | EXPIRED`

Fluxo de reembolso:

- `APPROVED -> REFUNDED`

## Saga Pattern

- Estrategia: **Coreografada**.
- Justificativa: reduz acoplamento, distribui responsabilidade de reacao por evento entre servicos.
- Pontos principais:
  - Billing reage ao evento `PAYMENT_REQUESTED` publicado pelo order-service.
  - Billing publica eventos de resultado (`PAYMENT_CONFIRMED`, `PAYMENT_FAILED`, `PAYMENT_REFUNDED`).

## Eventos publicados e consumidos

Publicados (payment.events):

- `PAYMENT_CONFIRMED` (`payment.confirmed`)
- `PAYMENT_FAILED` (`payment.failed`)
- `PAYMENT_REFUNDED` (`payment.refunded`)

Consumidos (order.events):

- `PAYMENT_REQUESTED` (`order.payment.requested`)

## Como rodar localmente

```bash
npm install
docker compose up postgres rabbitmq -d
cp .env.example .env  # ajuste os valores conforme necessario
npm run migration:run
npm run start:dev
```

## Como rodar os testes

```bash
npm run test -- --runInBand
npm run test:cov
npm run test:bdd
```

## Evidencias de cobertura

- Cobertura validada localmente via `npm run test:cov`.
- Threshold global configurado no `jest.config.ts`.

## Evidencias de pipeline CI/CD

- Workflow CD: `.github/workflows/ci-cd.yml` — build/test, build de imagem e deploy (main/develop).
- Workflow CI: `.github/workflows/ci.yml` — lint, test e SonarQube (pull requests).

## Link do Swagger

- UI: `http://localhost:3001/docs`
- Spec JSON: `swagger.json` (gerado no bootstrap da aplicacao).

## Tecnologias utilizadas

- NestJS
- TypeORM
- PostgreSQL
- RabbitMQ
- Mercado Pago SDK
- Jest
- Cucumber
- Docker
- Kubernetes

## Docker

```bash
docker build -t billing-service:local .
docker run --rm -p 3001:3001 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USER=billing \
  -e DB_PASS=billing \
  -e DB_NAME=billing \
  -e RABBITMQ_URL=amqp://guest:guest@host.docker.internal:5672 \
  -e MP_ACCESS_TOKEN=TEST-xxxx \
  -e MP_NOTIFICATION_URL=https://your-domain.com/billing/webhook/mercadopago \
  billing-service:local
```

## Kubernetes (manifests)

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/migration-job.yaml
```

