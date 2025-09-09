# Configuração da Integração Sicob

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Sicob API Configuration
SICOOB_CLIENT_ID=your_sicob_client_id_here
SICOOB_CLIENT_SECRET=your_sicob_client_secret_here
SICOOB_ENVIRONMENT=sandbox
```

## Como Obter as Credenciais do Sicob

1. **Cadastro no Portal de Desenvolvedores**:

   - Acesse: https://developers.sicoob.com.br/#!/cadastro
   - Realize o cadastro com seus dados

2. **Criar uma Aplicação**:

   - No portal, vá até "Meus Aplicativos"
   - Clique em "Nova Aplicação"
   - Preencha os dados da aplicação
   - Selecione a API "Cobrança Bancária"
   - Faça upload do certificado digital ICP Brasil

3. **Autorizar a Aplicação**:

   - Acesse o app do Sicoob no smartphone
   - Vá em "Transações Pendentes"
   - Autorize a aplicação criada
   - Aguarde o status mudar para "Ativo"

4. **Obter Credenciais**:
   - No portal, acesse sua aplicação
   - Copie o Client ID e Client Secret
   - Adicione ao arquivo `.env.local`

## Funcionalidades Implementadas

- ✅ Cálculo automático de 30% do valor dos serviços
- ✅ Geração de link de pagamento via API Sicob
- ✅ Página de pagamento integrada ao fluxo de agendamento
- ✅ Verificação de status de pagamento
- ✅ Confirmação automática do agendamento após pagamento
- ✅ Página de confirmação de pagamento

## Fluxo de Pagamento

1. Cliente seleciona serviços no agendamento
2. Sistema calcula automaticamente 30% do valor total
3. Gera link de pagamento via API Sicob
4. Cliente é redirecionado para página de pagamento
5. Após pagamento, agendamento é confirmado automaticamente
6. Cliente recebe confirmação do pagamento

## Testes

Para testar em ambiente sandbox:

- Use `SICOOB_ENVIRONMENT=sandbox`
- Os pagamentos serão simulados
- Não haverá cobrança real

Para produção:

- Use `SICOOB_ENVIRONMENT=production`
- Certifique-se de ter certificado digital válido
- Teste com valores pequenos primeiro
