# Acesso à Área Administrativa - Espaço Guapa

## Como acessar:

1. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

2. **Acesse a URL:**

   ```
   http://localhost:3000/admin
   ```

3. **Faça login com as credenciais:**
   - **Email:** `admin@espacoguapa.com`
   - **Senha:** `123456`

## Funcionalidades disponíveis:

### 🏠 Dashboard

- Visão geral com estatísticas
- Resumo de agendamentos
- Principais serviços
- Clientes VIP

### 👥 Clientes

- Lista completa de clientes
- Detalhes individuais
- **Histórico completo de atendimentos**
- **Estátisticas de visita e gastos**
- **Avaliações e satisfação**
- Importação de dados via Excel

### 📅 Agendamentos

- Agenda diária estilo Google Calendar
- Múltiplos profissionais
- Edição de agendamentos
- Sistema de tags
- Finalização de atendimentos com pagamento

### 🛒 Comandas

- Criação de comandas a partir de agendamentos
- Adição de serviços e produtos durante atendimento
- Controle de quantidades
- Resumo em tempo real
- Observações do atendimento
- **Finalização com pagamento** (integração completa)
- **Histórico salvo** na ficha da cliente
- **Dados financeiros** atualizados automaticamente

### ✂️ Serviços

- Gestão de serviços
- Categorização
- Preços e duração

### 💰 Financeiro

- Dashboard financeiro
- Métodos de pagamento
- Relatórios de receita

### 📊 Relatórios

- Diversos tipos de relatórios
- Filtros por período
- Exportação de dados

### 🌐 Editar Site

- **Galeria da Home:** Adicionar, editar e remover fotos do slide da página inicial
- **Profissionais:** Gerenciar informações das cabeleireiras
  - Nome, título e foto de perfil
  - Descrição e serviços realizados
  - Galeria de fotos de cada profissional
  - Adicionar ou deletar profissionais
- **Configurações Gerais:** Nome do site, endereço, WhatsApp, email

### ⚙️ Configurações

- Configurações do sistema
- Preferências gerais

### 🛍️ Produtos

- Gestão de produtos
- Categorias
- Controle de estoque

### 📦 Pedidos

- Gestão de pedidos de produtos
- Status de entrega
- Histórico de vendas

## URLs diretas:

- **Login:** `http://localhost:3000/admin/login`
- **Dashboard:** `http://localhost:3000/admin/dashboard`
- **Clientes:** `http://localhost:3000/admin/clientes`
- **Agendamentos:** `http://localhost:3000/admin/agendamentos`
- **Comandas:** `http://localhost:3000/admin/comandas`
- **Serviços:** `http://localhost:3000/admin/servicos`
- **Financeiro:** `http://localhost:3000/admin/financeiro`
- **Relatórios:** `http://localhost:3000/admin/relatorios`
- **Editar Site:** `http://localhost:3000/admin/editar-site`
- **Configurações:** `http://localhost:3000/admin/configuracoes`
- **Produtos:** `http://localhost:3000/admin/produtos`
- **Pedidos:** `http://localhost:3000/admin/pedidos`

## Páginas públicas:

- **Home:** `http://localhost:3000/`
- **Serviços:** `http://localhost:3000/servicos`
- **Profissionais:** `http://localhost:3000/profissionais`
- **Produtos:** `http://localhost:3000/produtos`
- **Agendamento:** `http://localhost:3000/agendamento`
