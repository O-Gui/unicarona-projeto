# UniCarona 🚗
---
# Como Rodar o UniCarona 
## 1. Iniciar os Serviços no Docker
cd unicarona-projeto e depois docker-compose up -d

## 2. Configurar a Base de Dados com o Prisma
cd unicarona-backend, e depois npx prisma generate e npx prisma migrate dev

## 3. Iniciar o Backend
cd unicarona-backend npm run start:dev

## 4. Iniciar o Aplicativo Móvel (Expo) - Em outro terminal
Iniciar o mobile usando o Expo, digite cd unicarona-mobile e depois npx expo start

## 5. Visualizar a Base de Dados (Prisma Studio) - Em outro terminal se desejar
(prisma no navegador) cd unicarona-backend e depois npx prisma studio

---

Sistema de compartilhamento de caronas desenvolvido para a comunidade universitária.

O UniCarona tem como objetivo facilitar a conexão entre estudantes que realizam trajetos semelhantes, permitindo o compartilhamento de caronas de forma simples e organizada.

---

## 📌 Sobre o projeto

O projeto é composto por uma aplicação **mobile** e uma API **backend**, utilizando autenticação de usuários, validação de e-mail institucional e gerenciamento de veículos.

### Funcionalidades implementadas

- Cadastro de usuário
- Validação de e-mail institucional
- Login com autenticação JWT
- Logout
- Recuperação de senha
- Redefinição de senha
- Cadastro de veículo
- Atualização de veículo
- Consulta dos dados do usuário
- Interface mobile das telas de autenticação
- Tela inicial (Splash Screen)
- Perfil do usuário

---

## 🏗️ Tecnologias utilizadas

### Backend

- [NestJS](https://nestjs.com/)
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Docker

### Mobile

- React Native
- Expo
- TypeScript
- Expo Go
- AsyncStorage

---

## 📁 Estrutura do projeto

```text
unicarona-projeto/
│
├── docker-compose.yml
│
├── unicarona-backend/
│   ├── prisma/
│   ├── src/
│   ├── test/
│   ├── .env.example
│   └── package.json
│
└── unicarona-mobile/
    ├── App.tsx
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

---

# 🚀 Configuração do projeto

## 1. Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- Node.js
- npm
- Git
- Docker Desktop
- Expo Go no celular

Para verificar as instalações:

```bash
node --version
npm --version
git --version
docker --version
```

---

# 📥 2. Clonar o repositório

Clone o projeto:

```bash
git clone https://github.com/O-Gui/unicarona-projeto.git
```

Entre na pasta do projeto:

```bash
cd unicarona-projeto
```

---

# 🌿 3. Acessar a branch de integração

As funcionalidades atualmente integradas entre o mobile e o backend estão na branch:

```text
feature/integracao-mobile-backend
```

Acesse a branch:

```bash
git checkout feature/integracao-mobile-backend
```

Atualize os arquivos:

```bash
git pull
```

---

# 🗄️ 4. Configurar o banco de dados

Na raiz do projeto, execute:

```bash
docker compose up -d
```

Para verificar se o container está funcionando:

```bash
docker ps
```

O PostgreSQL utilizado pelo projeto deverá estar em execução.

### Parar o banco

Quando terminar o desenvolvimento:

```bash
docker compose down
```

---

# 🔧 5. Configurar o Backend

Entre na pasta do backend:

```bash
cd unicarona-backend
```

Instale as dependências:

```bash
npm install
```

---

## 5.1 Configurar as variáveis de ambiente

Crie um arquivo `.env` a partir do arquivo de exemplo.

No Windows:

```bash
copy .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

Depois, abra o arquivo `.env` e configure as variáveis necessárias.

Exemplo:

```env
PORT=3000

DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/unicarona_db?schema=public"

JWT_EXPIRES_IN_SECONDS=86400

EMAIL_CODE_EXPIRATION_MINUTES=10
```

> **Importante:** os valores reais do `.env` são locais para cada desenvolvedor e não devem ser enviados para o Git.

---

# 🧬 6. Configurar o Prisma

Ainda dentro da pasta `unicarona-backend`, execute:

```bash
npx prisma generate
```

Depois execute as migrations:

```bash
npx prisma migrate dev
```

Esse processo cria e atualiza as estruturas necessárias no banco de dados.

---

# ▶️ 7. Executar o Backend

Dentro da pasta:

```text
unicarona-backend
```

execute:

```bash
npm run start:dev
```

O backend será executado na porta configurada, por padrão:

```text
http://localhost:3000
```

Mantenha esse terminal aberto enquanto estiver utilizando o aplicativo.

---

# 📱 8. Configurar o Mobile

Abra um **novo terminal**.

Volte para a raiz do projeto:

```bash
cd ..
```

Entre na pasta do aplicativo:

```bash
cd unicarona-mobile
```

Instale as dependências:

```bash
npm install
```

---

# 🌐 9. Configurar a conexão entre o celular e o Backend

Ao executar o aplicativo em um celular físico, **não utilize `localhost` para acessar o backend**.

Isso acontece porque:

```text
localhost
```

representa o próprio dispositivo que está fazendo a requisição.

Portanto, quando o aplicativo estiver no celular, ele precisa acessar o endereço IP do computador que está executando o backend.

---

## 9.1 Descobrir o IP do computador

No Windows, execute:

```bash
ipconfig
```

Procure pelo endereço:

```text
IPv4 Address
```

Exemplo:

```text
192.168.1.10
```

Nesse caso, o endereço do backend será:

```text
http://192.168.1.10:3000
```

---

# 🔌 10. Configurar a URL da API no Mobile

O aplicativo utiliza a variável:

```env
EXPO_PUBLIC_API_URL
```

Configure-a com o endereço IP do computador.

Exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

Substitua `192.168.1.10` pelo IPv4 da máquina que está executando o backend.

> O computador e o celular precisam estar conectados à mesma rede.

---

# 📶 11. Utilizando o roteador do celular

É possível utilizar o celular como ponto de acesso.

Nesse cenário:

1. Ative o roteador/ponto de acesso do celular.
2. Conecte o notebook à rede criada pelo celular.
3. Mantenha o celular conectado à própria rede.
4. Descubra o IPv4 do notebook utilizando `ipconfig`.
5. Configure o `EXPO_PUBLIC_API_URL` utilizando esse IP.
6. Execute o backend no notebook.
7. Execute o Expo.
8. Abra o aplicativo pelo Expo Go.

Exemplo:

```text
Notebook
    │
    │ Wi-Fi / Hotspot
    │
Celular
    │
    └── Expo Go
```

O aplicativo deverá acessar:

```text
http://IP_DO_NOTEBOOK:3000
```

e não:

```text
http://localhost:3000
```

---

# 🚀 12. Executar o aplicativo Mobile

Dentro de:

```text
unicarona-mobile
```

execute:

```bash
npx expo start
```

O Expo exibirá um QR Code.

Abra o aplicativo **Expo Go** no celular e escaneie o QR Code.

---

# 🔄 13. Ordem recomendada para executar o projeto

Para facilitar, siga esta ordem:

### Terminal 1 — Banco

Na raiz:

```bash
docker compose up -d
```

### Terminal 2 — Backend

```bash
cd unicarona-backend
npm install
npx prisma generate
npm run start:dev
```

### Terminal 3 — Mobile

```bash
cd unicarona-mobile
npm install
npx expo start
```

---

# 🔐 Autenticação

O sistema utiliza autenticação baseada em **JWT (JSON Web Token)**.

O fluxo de autenticação atualmente implementado é:

```text
Cadastro
   ↓
Verificação do e-mail
   ↓
Conta criada
   ↓
Login
   ↓
Token de acesso
   ↓
Acesso às funcionalidades protegidas
```

---

# 📧 Verificação de e-mail

Após o cadastro, o usuário recebe um código de verificação.

O código possui:

- 6 dígitos;
- tempo de expiração configurado no backend;
- invalidação dos códigos anteriores não utilizados.

O usuário precisa validar o e-mail institucional antes de realizar o login.

---

# 🔑 Recuperação de senha

O aplicativo possui o fluxo completo de recuperação de senha:

```text
Esqueci minha senha
        ↓
Informar e-mail
        ↓
Receber código
        ↓
Informar código
        ↓
Criar nova senha
        ↓
Login
```

---

# 👤 Cadastro de usuário

O cadastro atualmente solicita:

- Nome completo
- E-mail institucional
- CPF
- Curso
- Senha
- Aceite dos termos de uso

O usuário é cadastrado inicialmente como:

```text
PASSAGEIRO
```

Posteriormente, o sistema poderá permitir que o usuário ofereça caronas e passe a atuar também como motorista.

---

# 🚗 Cadastro de veículo

O usuário pode cadastrar seu veículo informando:

- Modelo do carro
- Placa
- Quantidade de vagas disponíveis

Também é possível atualizar os dados do veículo posteriormente.

Fluxo:

```text
Perfil
   ↓
Meu carro
   ↓
Cadastrar carro
   ↓
Salvar
```

Ou:

```text
Perfil
   ↓
Meu carro
   ↓
Editar
   ↓
Atualizar carro
```

---

# 📱 Telas atuais do Mobile

O aplicativo possui atualmente o seguinte fluxo inicial:

```text
Splash Screen
      ↓
Login
      ↓
 ┌────┴─────────────┐
 ↓                  ↓
Cadastro       Esqueci a senha
 ↓                  ↓
Verificação     Código
 ↓                  ↓
Conta criada    Nova senha
 ↓
Login
 ↓
Perfil
 ↓
Meu carro
```

---

# 🧪 Testes recomendados

Após executar o projeto, recomenda-se testar os seguintes fluxos.

## Cadastro

- [ ] Criar uma nova conta
- [ ] Informar e-mail institucional
- [ ] Receber código de verificação
- [ ] Informar código correto
- [ ] Testar código incorreto
- [ ] Testar código expirado
- [ ] Reenviar código
- [ ] Confirmar criação da conta

## Login

- [ ] Login com dados corretos
- [ ] Login com senha incorreta
- [ ] Login com e-mail inexistente
- [ ] Login antes da validação do e-mail

## Recuperação de senha

- [ ] Solicitar recuperação
- [ ] Receber código
- [ ] Informar código correto
- [ ] Testar código incorreto
- [ ] Criar nova senha
- [ ] Realizar login com a nova senha

## Veículo

- [ ] Cadastrar veículo
- [ ] Visualizar veículo
- [ ] Atualizar modelo
- [ ] Atualizar placa
- [ ] Atualizar quantidade de vagas

---

# ⚠️ Problemas comuns

## O aplicativo não consegue conectar ao Backend

Verifique:

1. O backend está executando?
2. O PostgreSQL está executando?
3. O celular e o notebook estão na mesma rede?
4. A variável `EXPO_PUBLIC_API_URL` está configurada corretamente?
5. O IP utilizado é o IPv4 do notebook?
6. A porta `3000` está liberada no firewall?

---

## `localhost:3000` não funciona no celular

Isso é esperado.

No celular:

```text
localhost
```

aponta para o próprio celular.

Utilize:

```text
http://IP_DO_NOTEBOOK:3000
```

Exemplo:

```text
http://192.168.1.10:3000
```

---

## O banco de dados não conecta

Verifique se o PostgreSQL está rodando:

```bash
docker ps
```

Confira também a variável:

```env
DATABASE_URL
```

no arquivo `.env`.

Depois tente:

```bash
npx prisma generate
```

e:

```bash
npx prisma migrate dev
```

---

## O Expo não conecta ao celular

Verifique se:

- o celular e o notebook estão na mesma rede;
- o Expo está executando;
- o Expo Go está atualizado;
- o firewall não está bloqueando a conexão.

Se necessário, o Expo pode ser executado utilizando uma conexão alternativa disponibilizada pelo próprio Expo.

---

# 🔒 Segurança

Os seguintes arquivos **não devem ser enviados para o Git**:

```text
.env
node_modules/
```

O arquivo `.env` pode conter informações sensíveis e configurações específicas da máquina.

Cada desenvolvedor deve criar seu próprio `.env` utilizando:

```text
.env.example
```

como referência.

---

# 🌿 Fluxo de desenvolvimento com Git

Evite realizar alterações diretamente na `main`.

Crie uma branch para cada funcionalidade.

Exemplo:

```text
main
 │
 └── feature/integracao-mobile-backend
        │
        ├── feature/nova-tela
        ├── feature/caronas
        ├── feature/perfil
        └── feature/avaliacoes
```

Para atualizar sua branch:

```bash
git checkout feature/integracao-mobile-backend
git pull
```

---

# 📦 Comandos principais

## Banco de dados

Iniciar:

```bash
docker compose up -d
```

Parar:

```bash
docker compose down
```

Ver containers:

```bash
docker ps
```

---

## Backend

Instalar dependências:

```bash
cd unicarona-backend
npm install
```

Gerar Prisma Client:

```bash
npx prisma generate
```

Executar migrations:

```bash
npx prisma migrate dev
```

Executar servidor:

```bash
npm run start:dev
```

---

## Mobile

Instalar dependências:

```bash
cd unicarona-mobile
npm install
```

Executar Expo:

```bash
npx expo start
```

---

# 🤝 Desenvolvimento em equipe

Ao desenvolver uma nova funcionalidade:

1. Atualize sua branch.
2. Crie uma nova branch de funcionalidade.
3. Desenvolva e teste localmente.
4. Faça o commit das alterações.
5. Envie a branch para o GitHub.
6. Abra um Pull Request.
7. Após revisão, realize a integração com a branch principal.

Exemplo:

```bash
git checkout feature/integracao-mobile-backend
git pull

git checkout -b feature/nova-funcionalidade
```

Após finalizar:

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push -u origin feature/nova-funcionalidade
```

---

# 📌 Branch atual

A versão deste README corresponde à branch:

```text
feature/integracao-mobile-backend
```

Esta branch contém a integração atual entre o aplicativo mobile e o backend, incluindo os fluxos de autenticação, verificação de e-mail, recuperação de senha e gerenciamento de veículo.

---

# 👥 Equipe

Projeto acadêmico desenvolvido por estudantes de Engenharia de Software.

## UniCarona

**Compartilhe o caminho. Conecte sua universidade.** 🚗
