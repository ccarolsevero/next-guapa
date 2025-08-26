# 🎨 Espaço Guapa - Sistema de Gestão para Salão de Beleza

Sistema completo de gestão para salão de beleza especializado em cabelos naturais, desenvolvido com Next.js 14, TypeScript, Prisma e Tailwind CSS.

## ✨ Funcionalidades

### 🏠 **Site Público**
- **Homepage**: Apresentação do salão com serviços e profissionais
- **Serviços**: Catálogo completo de serviços oferecidos
- **Profissionais**: Perfis detalhados da equipe
- **Produtos**: Loja virtual com sistema de pedidos
- **Agendamento**: Sistema de agendamento online
- **Cadastro/Login**: Área do cliente com painel personalizado

### 🔧 **Painel Administrativo**
- **Dashboard**: Visão geral com estatísticas e comissionamento
- **Clientes**: Gestão completa de clientes com histórico
- **Agendamentos**: Sistema de agendamento e comandas
- **Serviços**: Cadastro e edição de serviços
- **Produtos**: Gestão de produtos e estoque
- **Financeiro**: Controle financeiro e relatórios
- **Importação**: Importação de clientes via Excel

### 👥 **Área do Cliente**
- **Painel**: Dashboard personalizado
- **Agendamentos**: Histórico e novos agendamentos
- **Pedidos**: Acompanhamento de pedidos de produtos
- **Perfil**: Dados pessoais e preferências

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Autenticação**: JWT, bcrypt
- **Upload**: Multer, XLSX para importação
- **Deploy**: Vercel (recomendado)

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/ccarolsevero/next-guapa.git
cd next-guapa
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta-aqui"
```

4. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

5. **Execute o projeto**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📊 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   │   ├── clients/       # APIs de clientes
│   │   ├── auth/          # Autenticação
│   │   └── ...
│   ├── admin/             # Painel administrativo
│   ├── cadastro/          # Cadastro de clientes
│   ├── login-cliente/     # Login de clientes
│   ├── painel-cliente/    # Área do cliente
│   ├── servicos/          # Página de serviços
│   ├── profissionais/     # Página de profissionais
│   └── produtos/          # Loja de produtos
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
└── styles/                # Estilos globais
```

## 🎨 Design System

### Cores Principais
- **Coral/Rosa**: `#D15556`
- **Bege/Dourado**: `#EED7B6`
- **Verde**: `#006D5B`
- **Fundo**: `#F5F0E8`

### Tipografia
- **Títulos**: Font Light
- **Corpo**: Font Medium
- **Hierarquia**: Tamanhos responsivos

## 📋 Funcionalidades Detalhadas

### Sistema de Agendamento
- Agendamento online com seleção de profissional
- Confirmação via WhatsApp
- Sistema de comandas em tempo real
- Finalização com pagamento

### Gestão de Clientes
- Cadastro completo com histórico
- Importação via Excel com dados históricos
- Sistema de fidelidade
- Histórico de serviços e gastos

### Comissionamento
- Cálculo automático de comissões
- Separação por serviços e produtos
- Relatórios por profissional
- Dashboard de vendas

### Loja Virtual
- Catálogo de produtos
- Sistema de pedidos
- Categorização
- Gestão de estoque

## 🔐 Autenticação

### Admin
- **Email**: `admin@espacoguapa.com`
- **Senha**: `123456`

### Cliente
- Cadastro via site público
- Login com email e senha
- Recuperação de senha (futuro)

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 📱 Smartphones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Telas grandes

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- Netlify
- Railway
- Heroku
- DigitalOcean

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvedor

**Ana Carolina Severo**
- GitHub: [@ccarolsevero](https://github.com/ccarolsevero)
- Email: ccarolsevero@gmail.com

## 📞 Suporte

Para suporte, entre em contato:
- Email: ccarolsevero@gmail.com
- WhatsApp: (11) 99999-9999

---

**Espaço Guapa** - Transformando vidas através da beleza e autoestima ✨
