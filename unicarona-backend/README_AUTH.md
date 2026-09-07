# Backend — Login e Cadastro UniCarona

Implementação da HU01 conforme o Documento de Arquitetura: cadastro com CPF e e-mail institucional, confirmação por código, senha armazenada com hash e autenticação JWT.

## 1. Dependências

Execute:

```bash
npm install
```

As dependências de autenticação, Prisma/PostgreSQL e validação já estão declaradas no `package.json`.

## 2. Ambiente

Copie `.env.example` para `.env` e ajuste os valores quando necessário.

## 3. Banco

Suba o PostgreSQL/PostGIS pela raiz:

```bash
docker compose up -d
```

Como este repositório já possui um banco que pode ter sido criado anteriormente com `prisma db push`, a opção mais segura para atualizar a estrutura local é:

```bash
npx prisma generate
npx prisma db push
```

Se o banco estiver vazio e vocês quiserem usar migrations desde o início:

```bash
npx prisma migrate dev --name authentication
```

> Não execute `migrate dev` sobre um banco existente sem conferir o estado das migrations. O schema agora adiciona CPF, perfil e códigos de verificação.

## 4. Servidor

```bash
npm run start:dev
```

API padrão: `http://localhost:3000`

## 5. Endpoints

### Cadastro
`POST /auth/register`

```json
{
  "nome": "Maria Silva",
  "email": "maria.silva@a.ucb.br",
  "cpf": "52998224725",
  "senha": "Senha123",
  "perfil": "PASSAGEIRO"
}
```

### Verificar e-mail
`POST /auth/verify-email`

```json
{
  "email": "maria.silva@a.ucb.br",
  "codigo": "123456"
}
```

O código é exibido no terminal do backend durante o desenvolvimento.

### Reenviar código
`POST /auth/resend-verification`

```json
{
  "email": "maria.silva@a.ucb.br"
}
```

### Login
`POST /auth/login`

```json
{
  "email": "maria.silva@a.ucb.br",
  "senha": "Senha123"
}
```

### Usuário autenticado
`GET /auth/me`

```text
Authorization: Bearer <accessToken>
```

## Regras implementadas

- e-mail deve terminar em `@a.ucb.br`;
- CPF deve conter 11 dígitos e passar na validação dos dígitos verificadores;
- CPF e e-mail são únicos;
- senha possui mínimo de 8 caracteres, com letra e número;
- senha nunca é armazenada em texto puro: é derivada com `scrypt` e salt aleatório;
- código de e-mail é armazenado somente como SHA-256 e expira em 10 minutos por padrão;
- código usado é invalidado;
- login só é permitido depois da validação do e-mail;
- JWT possui expiração configurável;
- `/auth/me` exige Bearer token válido;
- respostas públicas não retornam `senhaHash` nem códigos de verificação.

## Próxima integração com o React Native

A tela de cadastro deve chamar `/auth/register`, navegar para a tela de código e então chamar `/auth/verify-email`. Após a confirmação, a tela de login chama `/auth/login` e guarda o `accessToken` para as requisições protegidas.
