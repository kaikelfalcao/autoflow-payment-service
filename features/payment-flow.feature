Feature: Payment Flow — Saga de Pagamento
  Como o sistema AutoFlow Billing
  Quero processar pagamentos via Mercado Pago
  Para que as ordens de serviço sejam aprovadas ou rejeitadas com base no resultado do pagamento

  Background:
    Given o Billing Service está operacional

  Scenario: Orçamento recebido e pagamento aprovado
    Given um evento "budget.sent" é recebido para a ordem "order-saga-01"
    And o valor total é 15000 centavos
    And o cliente possui id "customer-01"
    When o Billing Service processa o evento de orçamento
    Then uma cobrança é criada com status "PENDING"
    And uma preferência Mercado Pago é gerada com id "pref-test-01"
    And a cobrança possui um checkout URL válido
    When um webhook do Mercado Pago é recebido com status "approved" para o pagamento "pay-001"
    Then a cobrança é atualizada para o status "APPROVED"
    And um evento "payment.approved" é publicado para a ordem "order-saga-01"

  Scenario: Orçamento recebido e pagamento rejeitado
    Given um evento "budget.sent" é recebido para a ordem "order-saga-02"
    And o valor total é 25000 centavos
    And o cliente possui id "customer-02"
    When o Billing Service processa o evento de orçamento
    Then uma cobrança é criada com status "PENDING"
    When um webhook do Mercado Pago é recebido com status "rejected" para o pagamento "pay-002"
    Then a cobrança é atualizada para o status "REJECTED"
    And um evento "payment.rejected" é publicado para a ordem "order-saga-02"

  Scenario: Idempotência — mesmo evento processado duas vezes não duplica cobrança
    Given um evento "budget.sent" é recebido para a ordem "order-saga-03"
    And o valor total é 5000 centavos
    And o cliente possui id "customer-03"
    When o Billing Service processa o evento de orçamento
    And o Billing Service processa o mesmo evento novamente
    Then apenas uma cobrança existe para a ordem "order-saga-03"
