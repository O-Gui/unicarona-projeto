# Integração: telas do protótipo + backend

Este documento descreve o que mudou para que as telas do protótipo web
(`UNICARONA`) passassem a funcionar dentro do app Expo, conversando com o
backend NestJS.

## Como subir tudo

```bash
# 1. Banco com PostGIS
docker compose up -d

# 2. Backend
cd unicarona-backend
cp .env.example .env          # ajuste DATABASE_URL e JWT_SECRET
npm install
npx prisma migrate dev --name novas-features
npm run start:dev             # http://localhost:3000

# 3. App
cd ../unicarona-mobile
cp .env.example .env          # ajuste EXPO_PUBLIC_API_URL
npm install
npx expo start
```

A extensão PostGIS é criada pela própria migration (o schema declara
`extensions = [postgis]`). Se o banco não for a imagem `postgis/postgis`,
rode antes:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## O que mudou no backend

### Schema (`prisma/schema.prisma`)

- `Usuario`: curso, universidade, telefone, bio, fotoUrl, preferências,
  `statusVerificacao` e `criadoEm`.
- Novos modelos: `DocumentoVerificacao`, `Notificacao`, `Conversa`,
  `Mensagem`, `Denuncia`.
- `Veiculo`: cor e ano.
- `Rota`: nomes e endereços de origem e destino (os campos `geography` do
  PostGIS continuam acessíveis só por SQL cru).
- `Carona`: veículo, vagas totais e disponíveis, preço, observações,
  preferências e status.
- `Solicitacao`: vagas, mensagem e unicidade por passageiro + carona.
- `Avaliacao`: autor, alvo, comentário, categorias e tags.

### Módulos novos

| Módulo | Rotas principais |
| --- | --- |
| `usuario` | `/usuarios/me`, `PATCH /usuarios/me`, `/usuarios/me/estatisticas`, `/usuarios/me/verificacao`, `/usuarios/:id/avaliacoes` |
| `veiculo` | `/veiculos`, `/veiculos/me`, `POST /veiculos`, `DELETE /veiculos/:id` |
| `carona` | `/caronas`, `/caronas/locais`, `/caronas/minhas`, `/caronas/historico`, `/caronas/:id`, `PATCH /caronas/:id/cancelar`, `PATCH /caronas/:id/concluir` |
| `solicitacao` | `/solicitacoes`, `/solicitacoes/minhas`, `/solicitacoes/recebidas`, `PATCH /solicitacoes/:id/responder` |
| `avaliacao` | `POST /avaliacoes`, `/avaliacoes/viagem/:id/pendentes`, `/avaliacoes/resumo/:usuarioId` |
| `notificacao` | `/notificacoes`, `/notificacoes/nao-lidas`, `PATCH /notificacoes/:id/ler`, `PATCH /notificacoes/ler-todas` |
| `chat` | `/conversas`, `/conversas/:id/mensagens`, `/conversas/abrir`, `/conversas/mensagens` |
| `denuncia` | `POST /denuncias`, `/denuncias/minhas` |

### Mudanças que quebram o comportamento anterior

- **`POST /veiculos` agora exige JWT** e identifica o dono pelo token. O campo
  `usuarioId` no corpo foi removido.
- `UsuarioModule` passou a ter controller.
- `TokenService` e `JwtAuthGuard` saíram de `AuthModule` e vivem em
  `common/security.module.ts` (`@Global`), o que resolveu o ciclo entre
  `AuthModule` e `UsuarioModule`.

### Locais

As telas trabalham com nomes de lugares digitados, não com coordenadas. O
arquivo `src/common/locais.ts` guarda o catálogo (UCB Taguatinga, Centro, Asa
Sul/Norte, Águas Claras, Ceilândia, Samambaia, Guará, Shopping Taguatinga,
Campus Norte) com resolução por apelido. O app também pode enviar `lat`/`lng`
explícitos. A busca por proximidade usa `ST_DWithin` com raio padrão de 3 km.

## O que mudou no app

As 26 telas do protótipo eram HTML com Tailwind e shadcn. Elas foram
reescritas em React Native preservando a identidade visual: navy `#0B2A4A`,
laranja `#F28C18`, largura máxima de 448 px, cabeçalho navy, cartões brancos
com borda, faixa de avisos rolante e barra inferior de quatro abas.

O `App.tsx` antigo (cerca de mil linhas com telas embutidas) foi substituído
por um roteador que lê a pilha de `state/NavigationContext.tsx`.

Veja `unicarona-mobile/README.md` para a lista do que está ligado ao backend e
do que continua local.

## Verificação pendente

O ambiente onde o código foi escrito não tem `node_modules` nem rede, então
não foi possível rodar `tsc` ou `nest build`. Ao abrir o projeto:

```bash
cd unicarona-backend && npm install && npx tsc --noEmit
cd ../unicarona-mobile && npm install && npm run typecheck
```
