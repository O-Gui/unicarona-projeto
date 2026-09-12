# UniCarona Mobile

Frontend mobile em React Native com Expo Go para os fluxos de login, criação de conta, perfil do usuário e cadastro de carro.

## Executar

```bash
npm install
npx expo start
```

Abra o QR Code no Expo Go ou use `npm run web` para validar no navegador.

## Backend

O app foi preparado para o backend NestJS que está em `../unicarona-backend`:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/verify-email`

Configure o endereço do backend para um dispositivo físico com:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000 npx expo start
```

> **Pontos de atenção:** o login e cadastro estão com validação local e navegação demonstrável nesta etapa. Os comentários `TODO` em `App.tsx` marcam as integrações que dependem de endpoints de veículo, token JWT, verificação de e-mail e provedor OAuth. Em um celular, `localhost` não aponta para o computador que executa o NestJS; use o IP local da máquina ou um túnel seguro.

## Escopo entregue

- Login com e-mail, senha, recuperação informativa e login Google como placeholder.
- Cadastro com nome, e-mail institucional, CPF, senha e perfil passageiro/motorista/ambos.
- Perfil do usuário com resumo, ações e estado de veículo.
- Cadastro de carro com modelo, placa e capacidade de 1 a 4 vagas.
- Identidade visual baseada no Figma: azul-marinho `#0B2A4A`, laranja `#F28C18`, estética mobile Diva Tech.
