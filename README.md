Sim, é totalmente possível — e **é uma ótima ideia**. Como seus amigos vão clonar a branch e rodar o projeto em máquinas diferentes, o README deve explicar principalmente **pré-requisitos, banco, backend, mobile e como conectar o celular ao backend**.

Eu faria um `README.md` dentro da raiz do projeto (`unicarona-projeto/`) assim:

````md
# UniCarona 🚗

Aplicação de caronas universitárias desenvolvida para facilitar o compartilhamento de trajetos entre estudantes.

O projeto atualmente possui:

- Backend em NestJS
- Banco de dados PostgreSQL
- Prisma ORM
- Aplicativo mobile em React Native + Expo
- Autenticação com JWT
- Cadastro de usuários
- Validação de e-mail institucional
- Recuperação e redefinição de senha
- Cadastro e atualização de veículo
- Interface mobile das telas iniciais

---

# 📁 Estrutura do projeto

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
````

---

# 🛠️ Pré-requisitos

Antes de começar, instale:

* Node.js
* npm
* Git
* Docker Desktop
* Expo Go no celular

Verifique as instalações:

```bash
node --version
npm --version
git --version
docker --version
```

---

# 📥 1. Clonar o projeto

Clone o repositório:

```bash
git clone https://github.com/O-Gui/unicarona-projeto.git
```

Entre na pasta:

```bash
cd unicarona-projeto
```

Troque para a branch de integração:

```bash
git checkout feature/integracao-mobile-backend
```

Atualize a branch:

```bash
git pull
```

---

# 🗄️ 2. Subir o banco de dados

Na raiz do projeto:

```bash
docker compose up -d
```

Confira se o container está rodando:

```bash
docker ps
```

Deve aparecer o container do PostgreSQL do UniCarona.

---

# 🔧 3. Configurar o Backend

Entre na pasta:

```bash
cd unicarona-backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```bash
copy .env.example .env
```

> No Linux/macOS, use:
>
> ```bash
> cp .env.example .env
> ```

Abra o `.env` e configure:

```env
PORT=3000

DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/unicarona_db?schema=public"

JWT_EXPIRES_IN_SECONDS=86400

EMAIL_CODE_EXPIRATION_MINUTES=10
```

> Não faça commit do arquivo `.env`.

---

# 🧬 4. Configurar o Prisma

Ainda dentro de `unicarona-backend`:

Gere o Prisma Client:

```bash
npx prisma generate
```

Execute as migrations:

```bash
npx prisma migrate dev
```

Se o banco estiver vazio e tudo estiver configurado corretamente, as tabelas serão criadas.

---

# ▶️ 5. Rodar o Backend

Dentro de:

```text
unicarona-backend
```

execute:

```bash
npm run start:dev
```

O backend ficará disponível em:

```text
http://localhost:3000
```

⚠️ **Importante:** `localhost` funciona apenas para a própria máquina.

Quando o aplicativo for aberto em um celular físico, o celular precisa acessar o IP da máquina que está rodando o backend.

---

# 📱 6. Configurar o Mobile

Abra outro terminal.

Volte para a raiz:

```bash
cd ..
```

Entre no mobile:

```bash
cd unicarona-mobile
```

Instale as dependências:

```bash
npm install
```

---

# 🌐 7. Configurar o endereço do Backend

Para testar pelo celular, o aplicativo não deve usar:

```text
http://localhost:3000
```

O celular precisa acessar o endereço IP do computador.

### Descobrir o IP do computador

No Windows:

```bash
ipconfig
```

Procure o endereço IPv4 da rede Wi-Fi, por exemplo:

```text
IPv4 Address: 192.168.1.10
```

Então o endereço do backend será:

```text
http://192.168.1.10:3000
```

---

# 🔌 8. Configurar a URL da API

No projeto mobile, configure a variável:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

Substitua `192.168.1.10` pelo IPv4 da máquina que está rodando o backend.

> O computador e o celular precisam estar conectados à mesma rede.
>
> Se estiver usando o roteador do celular, conecte o notebook e o celular à mesma rede/hotspot.

---

# 🚀 9. Rodar o aplicativo

Dentro de:

```text
unicarona-mobile
```

execute:

```bash
npx expo start
```

Será exibido um QR Code no terminal.

Abra o aplicativo **Expo Go** no celular e escaneie o QR Code.

---

# 📲 10. Testando no celular

Com o backend rodando:

```bash
npm run start:dev
```

e o Expo rodando:

```bash
npx expo start
```

o fluxo inicial pode ser testado:

```text
Splash
   ↓
Login
   ↓
Cadastro
   ↓
Verificação de e-mail
   ↓
Conta criada
   ↓
Login
   ↓
Perfil
   ↓
Cadastro de veículo
```

Também é possível testar:

* Login
* Logout
* Recuperação de senha
* Código de recuperação
* Redefinição de senha
* Cadastro de veículo
* Atualização dos dados do veículo

---

# 🔐 Autenticação

O backend utiliza JWT para autenticação.

Após o login, o aplicativo recebe um token de acesso e utiliza esse token nas requisições protegidas.

O cadastro inicialmente cria o usuário como:

```text
PASSAGEIRO
```

Posteriormente o usuário poderá oferecer caronas e utilizar funcionalidades relacionadas a motorista.

---

# 📧 Verificação de e-mail

Após o cadastro, o backend envia um código de verificação.

O código possui:

* 6 dígitos
* tempo de expiração configurado no `.env`
* invalidação de códigos anteriores não utilizados

O usuário precisa validar o e-mail antes de realizar o login.

---

# 🔑 Recuperação de senha

O aplicativo possui o fluxo:

```text
Esqueci minha senha
        ↓
Informar e-mail
        ↓
Receber código
        ↓
Validar código
        ↓
Criar nova senha
        ↓
Login
```

---

# 🚗 Veículo

O usuário pode cadastrar seu veículo informando:

* Modelo
* Placa
* Quantidade de vagas

Também é possível atualizar os dados do veículo posteriormente.

---

# ⚠️ Problemas comuns

## O celular não consegue conectar ao backend

Verifique:

1. Backend está rodando?
2. Notebook e celular estão na mesma rede?
3. A `EXPO_PUBLIC_API_URL` está usando o IP do notebook?
4. A porta `3000` está disponível?
5. O firewall do Windows está bloqueando o Node?

Teste no navegador do celular:

```text
http://IP_DO_NOTEBOOK:3000
```

---

## `localhost:3000` não funciona no celular

Isso é esperado.

No celular:

```text
localhost
```

significa **o próprio celular**, e não o notebook.

Use:

```text
http://IP_DO_NOTEBOOK:3000
```

Exemplo:

```text
http://192.168.1.10:3000
```

---

## Prisma não consegue conectar ao banco

Verifique se o PostgreSQL está rodando:

```bash
docker ps
```

Depois confira a `DATABASE_URL` no `.env`.

Também tente:

```bash
npx prisma generate
```

e:

```bash
npx prisma migrate dev
```

---

# 🌿 Branch de integração

As alterações atuais estão na branch:

```text
feature/integracao-mobile-backend
```

Para atualizar sua cópia local:

```bash
git checkout feature/integracao-mobile-backend
git pull
```

---

# 👥 Desenvolvimento em equipe

Cada desenvolvedor deve trabalhar em sua própria branch.

Exemplo:

```text
main
 │
 └── feature/integracao-mobile-backend
        │
        ├── feature/nova-tela
        ├── feature/caronas
        └── feature/perfil
```

Evite trabalhar diretamente na `main`.

---

# 🔒 Arquivos que NÃO devem ser enviados

Não faça commit de:

```text
.env
node_modules/
```

O arquivo `.env` contém configurações locais e deve ser criado individualmente por cada desenvolvedor.

Utilize:

```text
.env.example
```

como referência.

---

# 💡 Comandos rápidos

### Backend

```bash
cd unicarona-backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Mobile

Em outro terminal:

```bash
cd unicarona-mobile
npm install
npx expo start
```

### Banco

Na raiz:

```bash
docker compose up -d
```

Para parar:

```bash
docker compose down
```

---

# 🚗 UniCarona

Projeto acadêmico desenvolvido para a comunidade universitária, com foco em compartilhamento de caronas, mobilidade e colaboração entre estudantes.

```

### ⚠️ Só faria uma alteração antes de você colocar esse README

Eu **não colocaria uma `DATABASE_URL` real** no README. Cada amigo deve colocar a própria configuração no `.env`.

E tem uma coisa importante: **o README precisa bater exatamente com o `docker-compose.yml` e o `.env.example` que estão na branch**. Como vocês acabaram de alterar a estrutura do projeto, vale conferir esses dois arquivos antes de você commitar o README.

Se quiser, me mande o conteúdo do **`docker-compose.yml` e `.env.example`** (ou os arquivos) e eu ajusto o README para ficar **100% copiável pelos seus amigos, sem eles terem que adivinhar usuário, senha, porta ou nome do banco**.
```
