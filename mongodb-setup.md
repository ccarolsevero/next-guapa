# Configuração MongoDB Atlas

## 1. Criar conta no MongoDB Atlas

- Acesse: https://www.mongodb.com/atlas
- Clique em "Try Free"
- Crie uma conta gratuita

## 2. Criar cluster

- Escolha o plano "FREE" (M0)
- Provedor: AWS
- Região: São Paulo
- Clique em "Create"

## 3. Configurar acesso

- Crie usuário do banco:
  - Username: guapa
  - Password: guapa123456
- Configure acesso de rede:
  - Network Access > Add IP Address
  - Allow Access from Anywhere (0.0.0.0/0)

## 4. Obter string de conexão

- Clique em "Connect"
- Escolha "Connect your application"
- Copie a string de conexão

## 5. String de conexão esperada:

```
mongodb+srv://guapa:guapa123456@cluster0.xxxxx.mongodb.net/guapa?retryWrites=true&w=majority
```

## 6. Configurar no projeto

- Substitua a string no arquivo .env
- Configure na Vercel
