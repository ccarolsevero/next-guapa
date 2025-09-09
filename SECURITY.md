# 🔒 Guia de Segurança - Espaço Guapa

## ✅ Implementações de Segurança

### 1. **Headers de Segurança**
- **Content Security Policy (CSP)**: Previne ataques XSS
- **HSTS**: Força conexões HTTPS
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **X-XSS-Protection**: Proteção adicional contra XSS
- **Referrer-Policy**: Controla informações de referência
- **Permissions-Policy**: Controla permissões do navegador

### 2. **Middleware de Segurança**
- **Rate Limiting**: Limita requisições por IP
- **Blocking de Ataques**: Bloqueia padrões de SQL injection, XSS e path traversal
- **Validação de Origem**: Verifica origens permitidas

### 3. **Validação e Sanitização**
- **Input Sanitization**: Remove caracteres perigosos
- **Email Validation**: Valida formato de email
- **Phone Validation**: Valida formato de telefone
- **Password Strength**: Valida força da senha
- **SQL Injection Prevention**: Sanitiza para SQL
- **XSS Prevention**: Escapa HTML

### 4. **Proteção de APIs**
- **Rate Limiting**: 100 requisições por 15 minutos
- **Origin Validation**: Verifica origens permitidas
- **Input Validation**: Valida todos os inputs
- **Error Handling**: Não expõe informações sensíveis

### 5. **Configuração Segura**
- **Environment Variables**: Configuração centralizada
- **Validation**: Validação de variáveis obrigatórias
- **Warnings**: Avisos para configurações inseguras

## 🚀 Como Usar

### Variáveis de Ambiente Recomendadas
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guapa

# Security (IMPORTANTE: Mude em produção!)
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key

# CORS
ALLOWED_ORIGINS=https://espacoguapa.com,https://www.espacoguapa.com

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Origens Permitidas
- `http://localhost:3000` (desenvolvimento)
- `http://localhost:3001` (desenvolvimento)
- `http://localhost:3002` (desenvolvimento)
- `https://next-guapa.vercel.app` (Vercel)
- `https://espacoguapa.com` (produção)
- `https://www.espacoguapa.com` (produção)

## ⚠️ Importante para Produção

1. **Mude as senhas padrão**:
   - JWT_SECRET
   - SESSION_SECRET
   - Senhas de admin

2. **Configure HTTPS**:
   - Certificado SSL válido
   - Redirecionamento HTTP → HTTPS

3. **Monitore logs**:
   - Rate limiting
   - Tentativas de ataque
   - Erros de validação

4. **Backup regular**:
   - Database
   - Arquivos de upload
   - Configurações

## 🛡️ Proteções Implementadas

- ✅ **XSS Protection**: Headers + sanitização
- ✅ **SQL Injection**: Validação + sanitização
- ✅ **CSRF Protection**: Origin validation
- ✅ **Clickjacking**: X-Frame-Options
- ✅ **Rate Limiting**: Proteção contra spam
- ✅ **Input Validation**: Todos os inputs validados
- ✅ **HTTPS Enforcement**: HSTS headers
- ✅ **Content Security**: CSP headers

## 📊 Status de Segurança

O site está protegido contra as principais vulnerabilidades web:
- **OWASP Top 10** coberto
- **Headers de segurança** implementados
- **Validação robusta** de inputs
- **Rate limiting** ativo
- **CORS** configurado

## 🔧 Manutenção

- Monitore logs de segurança
- Atualize dependências regularmente
- Revise configurações periodicamente
- Teste vulnerabilidades com ferramentas como OWASP ZAP
