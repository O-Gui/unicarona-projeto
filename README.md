# UniCarona - Projeto de Matching Geográfico

Este projeto utiliza Node.js, NestJS, Prisma ORM e PostgreSQL com PostGIS (via Docker) para gerenciar o sistema de caronas universitárias com rotas geoespaciais.

## Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando.
- [Node.js](https://nodejs.org/) (versão 18+ recomendada).

## Como rodar o projeto

**1. Ligar o Banco de Dados:**

Na pasta raiz (`unicarona-projeto`), execute:
```bash
docker compose up -d


**2. Instalar as dependências:**

Entre na pasta do backend e instale os pacotes:

```Bash
cd unicarona-backend
npm install

**3. Iniciar o servidor:**

```Bash
npm run start:dev

**4. Visualizar o Banco de Dados (Interface Gráfica):**

Se quiser inspecionar as tabelas visualmente no navegador, abra um novo terminal na pasta do backend e execute:

```Bash
npx prisma studio

DATABASE_URL="postgresql://postgres:minha_senha_segura@localhost:5432/unicarona_db?schema=public"
