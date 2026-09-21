# UniCarona 🚗

Sistema de compartilhamento de caronas desenvolvido para a comunidade universitária.

O UniCarona tem como objetivo facilitar a conexão entre estudantes que realizam trajetos semelhantes, permitindo o compartilhamento de caronas de forma simples, organizada e segura.

---

## 📌 Sobre o projeto

O UniCarona é composto por uma aplicação **mobile** e uma API **backend**, responsáveis pela autenticação dos usuários, gerenciamento de veículos, criação e busca de caronas, localização, comunicação entre usuários e demais funcionalidades da aplicação.

O projeto utiliza autenticação por JWT e validação do e-mail institucional para garantir que os usuários pertençam à comunidade universitária.

---

# ✨ Funcionalidades

## 🔐 Autenticação e conta

- Cadastro de usuário
- Validação de e-mail institucional
- Login com autenticação JWT
- Logout
- Recuperação de senha
- Verificação de código para recuperação de senha
- Redefinição de senha
- Armazenamento do token de autenticação
- Proteção de funcionalidades autenticadas

---

## 👤 Usuário

- Consulta dos dados do usuário
- Perfil do usuário
- Atualização de informações do perfil
- Cadastro de curso
- Definição inicial do usuário como passageiro
- Possibilidade de utilização do sistema como motorista ao oferecer caronas

---

## 🚗 Veículos

- Cadastro de veículo
- Consulta do veículo cadastrado
- Atualização do veículo
- Modelo do veículo
- Placa
- Quantidade de vagas disponíveis
- Associação do veículo às caronas oferecidas

---

## 🚘 Caronas

- Oferecer carona
- Informar origem e destino
- Definir data e horário da viagem
- Definir quantidade de vagas
- Definir preço por passageiro
- Adicionar observações
- Definir preferências da carona
- Utilizar localização atual como origem
- Visualizar detalhes da carona
- Cancelar carona
- Concluir carona
- Consultar caronas oferecidas
- Consultar caronas reservadas
- Histórico de caronas

---

## 📍 Localização e mapa

O aplicativo possui suporte à localização do dispositivo.

O usuário pode utilizar sua localização atual ao oferecer uma carona.

Quando o usuário seleciona:

> **Usar minha localização atual**

o aplicativo solicita permissão para acessar a localização do dispositivo e obtém:

- Latitude
- Longitude

Essas coordenadas são enviadas ao backend para serem utilizadas como origem da carona.

O aplicativo também possui uma tela de **Mapa do Campus**, com suporte a pontos de localização cadastrados no sistema.

### Permissão de localização

A localização é utilizada somente quando necessária para as funcionalidades que dependem dela.

Caso a permissão seja negada, o aplicativo informa ao usuário que é necessário habilitar a localização nas configurações do dispositivo.

---

## 💬 Comunicação

O projeto possui estrutura para comunicação entre usuários relacionada às caronas.

As conversas são vinculadas a uma carona específica.

Uma conversa deve estar associada a uma carona para garantir que a comunicação esteja relacionada ao contexto da viagem.

---

## 🔔 Notificações

O backend possui estrutura para notificações relacionadas às funcionalidades do sistema.

As notificações podem ser utilizadas para eventos relacionados a:

- Solicitações de carona
- Mensagens
- Alterações no status de caronas
- Outros eventos da aplicação

---

# 🏗️ Tecnologias utilizadas

## Backend

- [NestJS](https://nestjs.com/)
- TypeScript
- Prisma ORM
- PostgreSQL
- PostGIS
- JWT
- Docker
- class-validator
- class-transformer

## Mobile

- React Native
- Expo
- TypeScript
- Expo Go
- AsyncStorage
- Expo Location
- React Native Maps

---

# 📁 Estrutura do projeto

```text
unicarona-projeto/
│
├── docker-compose.yml
│
├── unicarona-backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── ...
│   ├── src/
│   ├── test/
│   ├── .env.example
│   └── package.json
│
└── unicarona-mobile/
    ├── App.tsx
    ├── app.json
    ├── package.json
    ├── tsconfig.json
    ├── .env
    └── src/
        ├── components/
        ├── constants/
        ├── lib/
        ├── navigation/
        ├── screens/
        ├── services/
        ├── state/
        ├── storage/
        ├── theme/
        └── types/
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
- ngrok (quando for utilizar acesso externo ao backend)

Para verificar as instalações:

```bash
node --version
npm --version
git --version
docker --version
ngrok version
```

## 📥 2. Clonar o repositório
Clone o projeto:

```bash
git clone https://github.com/O-Gui/unicarona-projeto.git
```

Entre na pasta:

```bash
cd unicarona-projeto
```

## 🌿 3. Acessar a branch atual
A versão atual integrada do projeto está na branch: `novasfeatures`

Para acessar a branch:

```bash
git fetch origin
```

Se a branch ainda não existir localmente:

```bash
git switch -c novasfeatures --track origin/novasfeatures
```

Caso ela já exista localmente:

```bash
git switch novasfeatures
```

Para confirmar:

```bash
git branch
```
A branch atual deverá aparecer com `*`:
```text
* novasfeatures
  main
```

## 🗄️ 4. Configurar o banco de dados
O projeto utiliza PostgreSQL com PostGIS através do Docker.
Na raiz do projeto:

```bash
docker compose up -d
```

Verifique os containers:

```bash
docker ps
```

O PostgreSQL utilizado pelo projeto deve estar em execução e disponível na porta `5432`.

### Parar o banco
Quando terminar o desenvolvimento:

```bash
docker compose down
```

## 🔧 5. Configurar o Backend
Entre na pasta do backend:

```bash
cd unicarona-backend
```

Instale as dependências:

```bash
npm install
```

### 🔐 5.1 Configurar as variáveis de ambiente
Crie o arquivo `.env` a partir do `.env.example`.

**Windows**
```cmd
copy .env.example .env
```

**Linux/macOS**
```bash
cp .env.example .env
```

Depois abra o arquivo `.env` e configure as variáveis. Exemplo:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/unicarona_db?schema=public"
PORT=3000
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRES_IN_SECONDS=86400
EMAIL_CODE_EXPIRATION_MINUTES=10
```

> **Importante:** os valores reais do `.env` são específicos de cada ambiente e não devem ser enviados para o Git.

## 🧬 6. Configurar o Prisma
Ainda dentro de `unicarona-backend`:

Gere o Prisma Client:

```bash
npx prisma generate
```

Depois sincronize o schema do Prisma com o banco de dados:

```bash
npx prisma db push
```

O `db push` deve ser utilizado para sincronizar o banco de desenvolvimento com o `schema.prisma`.

> **Atenção:** não utilize `prisma migrate reset` para este projeto sem verificar antes, pois esse comando pode apagar os dados do banco.

Depois de alterações no `schema.prisma`, execute novamente:
```bash
npx prisma generate
```
e, quando necessário:
```bash
npx prisma db push
```

## ▶️ 7. Executar o Backend
Dentro da pasta `unicarona-backend`, execute:

```bash
npm run start:dev
```

O backend será executado, por padrão, em: `http://localhost:3000`

Mantenha esse terminal aberto enquanto estiver utilizando o aplicativo.

## 📱 8. Configurar o Mobile
Abra um novo terminal. Volte para a raiz do projeto e entre na pasta mobile:

```bash
cd ..
cd unicarona-mobile
npm install
```

### 📍 8.1 Dependências de localização e mapa
O projeto utiliza localização e mapa. Caso seja necessário instalar novamente as dependências:

```bash
npx expo install expo-location
npx expo install react-native-maps
```

Essas dependências são compatíveis com a versão do Expo utilizada no projeto.

## 🌐 9. Configurar a conexão entre o celular e o Backend
Quando o aplicativo é executado em um celular físico, não deve ser utilizado `localhost` para acessar o backend (pois no celular, `localhost` representa o próprio celular). O aplicativo precisa acessar o computador que está executando o backend através de duas formas principais:
1. Utilizando o IP do computador na mesma rede;
2. Utilizando ngrok.

### 📶 10. Opção A — Computador e celular na mesma rede
Certifique-se de que o computador e o celular estejam conectados à mesma rede Wi-Fi.
No Windows, execute `ipconfig` e procure por **IPv4 Address** (ex: `192.168.1.10`).

### 🔌 11. Configurar a URL da API no Mobile
No arquivo `unicarona-mobile/.env`, configure:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```
*(Substitua pelo IPv4 real do computador).*

Depois de alterar o `.env`, reinicie o Expo limpando o cache:
```bash
npx expo start -c
```

### 🌎 12. Opção B — Utilizando ngrok
O ngrok permite disponibilizar temporariamente o backend através de uma URL HTTPS.

1. **Iniciar o backend** (`npm run start:dev` na porta 3000).
2. **Iniciar o ngrok**:
   ```bash
   ngrok http 3000
   ```
   O ngrok exibirá uma URL semelhante a `https://exemplo.ngrok-free.dev`.
3. **Configurar o Mobile** em `unicarona-mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://exemplo.ngrok-free.dev
   ```
4. Reinicie o Expo: `npx expo start -c`

> **Importante:** a URL do ngrok pode mudar quando uma nova sessão for iniciada.

## 📱 13. Executar o aplicativo Mobile
Dentro de `unicarona-mobile`:

```bash
npx expo start
```

O Expo exibirá um QR Code. Abra o aplicativo Expo Go no celular e escaneie o QR Code.

---

# 🔄 Ordem recomendada para executar o projeto (Fluxo rápido)

Se todas as dependências já estiverem instaladas:

1. **Banco:**
   ```bash
   docker compose up -d
   ```
2. **Backend:**
   ```bash
   cd unicarona-backend
   npm run start:dev
   ```
3. **Ngrok (Terminal separado):**
   ```bash
   ngrok http 3000
   ```
   *(Copie a URL HTTPS e atualize no `unicarona-mobile/.env`)*
4. **Mobile:**
   ```bash
   cd unicarona-mobile
   npx expo start -c
   ```
5. **Abrir no Expo Go** escaneando o QR Code.

---

# 🔐 Autenticação e Fluxos Principais

- **JWT:** JSON Web Token utilizado para proteger rotas.
- **Cadastro & Verificação de E-mail:** Envio de código de 6 dígitos com tempo de expiração configurado no backend.
- **Recuperação de Senha:** Fluxo completo (Esqueci minha senha -> E-mail -> Código -> Nova senha -> Login).
- **Veículos:** Cadastro de modelo, placa e vagas através do perfil.
- **Caronas:** Definição de origem, destino, data, horário, vagas, preço e preferências. Suporte a geolocalização e Mapa do Campus (`react-native-maps`).
- **Chat & Notificações:** Conversas vinculadas diretamente a uma carona específica e notificações de eventos do sistema.

---

# ⚠️ Problemas comuns

- **O aplicativo não conecta ao Backend / localhost não funciona:** Lembre-se de não usar `localhost:3000` em dispositivos físicos. Use o IP da rede local ou a URL do ngrok, e execute `npx expo start -c` após salvar o `.env`.
- **O banco de dados não conecta:** Verifique `docker ps` e garanta que o container PostgreSQL está rodando, conferindo a variável `DATABASE_URL`.
- **Erros no Prisma:** Execute `npx prisma generate` e `npx prisma db push`. Evite comandos destrutivos como `prisma migrate reset`.
- **Localização não funciona:** Confirme se o pacote `expo-location` está instalado e se as permissões de localização estão habilitadas nas configurações do sistema do aparelho (ex: Ajustes > Privacidade > Serviços de Localização > Expo Go no iOS).

---

# 🔒 Segurança & Boas Práticas

- Nunca envie arquivos `.env` ou a pasta `node_modules/` para o Git. Utilize sempre o `.env.example` como guia.
- Para verificar erros de TypeScript antes de commitar:
  - **Backend:** `cd unicarona-backend && npx tsc --noEmit`
  - **Mobile:** `cd unicarona-mobile && npx tsc --noEmit`

---

## 🏫 Projeto acadêmico
O UniCarona é um projeto acadêmico desenvolvido por estudantes de Engenharia de Software com o intuito de facilitar a mobilidade da comunidade universitária.

🚗 **UniCarona** — *Compartilhe o caminho. Conecte sua universidade.*