# UniCarona Mobile

App Expo (React Native) com as telas do protótipo UniCarona portadas para
`StyleSheet` e ligadas ao backend NestJS de `../unicarona-backend`.

## Executar

```bash
cp .env.example .env     # ajuste EXPO_PUBLIC_API_URL
npm install
npx expo start
```

No emulador Android o backend responde em `http://10.0.2.2:3000`; num celular
com Expo Go, use o IP da sua máquina na rede (ex.: `http://192.168.0.10:3000`).

## Como o código está organizado

| Pasta | O que tem |
| --- | --- |
| `theme/` | Cores, espaçamentos, raios e tipografia. Nenhuma tela escreve hex literal. |
| `components/ui.tsx` | Primitivas do design system (Header, Card, Button, Field, RouteLine...). |
| `components/Icon.tsx` | Mapa dos nomes de ícone do protótipo (lucide) para Ionicons. |
| `components/AppChrome.tsx` | Faixa de avisos e barra inferior de navegação. |
| `lib/api.ts` | Cliente HTTP único: base URL, token JWT, tratamento de 401. |
| `lib/servicos.ts` | Um método por endpoint do backend. |
| `lib/tipos.ts` | Contratos devolvidos pela API. |
| `state/AuthContext.tsx` | Sessão: restaura do AsyncStorage e revalida em `/auth/me`. |
| `state/NavigationContext.tsx` | Pilha de telas própria (o projeto não usa react-navigation). |
| `screens/` | Uma tela por arquivo, com o mesmo nome do protótipo web. |

## O que está ligado ao backend

Autenticação, verificação de e-mail e recuperação de senha, verificação de
identidade, perfil e estatísticas, veículos, busca e publicação de caronas,
solicitações, avaliações, notificações, chat, histórico e denúncias.

## O que ainda é local (sem backend)

- **Métodos de pagamento** — a lista vive em memória; não há endpoint de pagamento.
- **Privacidade** — os toggles ficam no aparelho. Para persistir, criar um campo
  `Json` em `Usuario` e enviar por `PATCH /usuarios/me`.
- **Carteira** — saldo e extrato são calculados a partir das viagens concluídas;
  não há movimentação financeira real.
- **Emergência** — o botão do pânico abre a ligação para o 190, mas não dispara
  alerta no servidor.
- **Mapa do campus** — lista os pontos de `GET /caronas/locais`; não embarca um
  mapa (react-native-maps não está instalado).
- **Grupos** — uma "carona em grupo" é uma carona com 3 vagas ou mais.

## Notas

- `lucide-react-native` foi removido do `package.json`: os ícones passam por
  `components/Icon.tsx`, que traduz os nomes do protótipo para Ionicons (já
  presente no Expo). Para trocar de biblioteca depois, basta reescrever esse
  arquivo.
- A fonte Inter não foi adicionada para não incluir dependência nova; o tema usa
  apenas os pesos.
