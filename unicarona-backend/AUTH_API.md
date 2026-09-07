# UniCarona — API de Login e Cadastro

## Subir banco

Na raiz do projeto:

```bash
docker compose up -d
```

## Configurar backend

```bash
cd unicarona-backend
copy .env.example .env
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

> O `.env` local já foi incluído para o Docker Compose deste projeto. Não versionar `.env` em um repositório público.

## Endpoints

### POST /auth/register

```json
{
  "nome": "Maria Silva",
  "email": "maria.silva@a.ucb.br",
  "cpf": "52998224725",
  "senha": "Senha123",
  "perfil": "PASSAGEIRO"
}
```

Perfis: `PASSAGEIRO`, `MOTORISTA`, `AMBOS`.

### POST /auth/verify-email

```json
{
  "email": "maria.silva@a.ucb.br",
  "codigo": "123456"
}
```

Em desenvolvimento, o código é mostrado no terminal do backend.

### POST /auth/resend-verification

```json
{
  "email": "maria.silva@a.ucb.br"
}
```

### POST /auth/login

```json
{
  "email": "maria.silva@a.ucb.br",
  "senha": "Senha123"
}
```

Retorna `accessToken` no padrão Bearer.

### GET /auth/me

Header:

```text
Authorization: Bearer <accessToken>
```

## Fluxo do app

1. Cadastro → `POST /auth/register`
2. Usuário recebe código → `POST /auth/verify-email`
3. Login → `POST /auth/login`
4. App guarda o `accessToken`
5. Requisições autenticadas usam `Authorization: Bearer ...`
6. Usuário atual → `GET /auth/me`

## Observação sobre e-mail

O projeto está preparado com um serviço separado de verificação. Enquanto SMTP não estiver configurado, o código é enviado ao logger do NestJS para facilitar o desenvolvimento. Antes da entrega em produção, conecte esse serviço a um provedor de e-mail institucional.
