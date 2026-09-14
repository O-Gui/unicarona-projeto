# 🚗 UniCarona — Acompanhamento e Metodologia

Quadro de fluxo contínuo (Kanban) e Roadmap de desenvolvimento do sistema de caronas universitárias UniCarona.

---

## 👥 Atribuições da Equipe
* **Back-end & Geoprocessamento (NestJS / Prisma / PostGIS):** @Guilherme Basilio / @Grazielly Sabino
* **Front-end Mobile (React Native):** @Vinicius
* **Requisitos, Documentação & Arquitetura:** Equipe

---

## 🗺️ Roadmap de Módulos (Visão Geral)

| Módulo | Escopo & Regras de Negócio | Responsáveis | Status |
| :--- | :--- | :---: | :---: |
| **M1: Autenticação & Usuários** | Cadastro institucional (`@a.ucb.br`), tokens JWT e validação | @Guilherme / @Vinicius | **Concluído** ✅ |
| **M2: Gestão de Veículos** | Cadastro de veículos, placas e capacidade (1 a 4 vagas) | Equipe | **Concluído** ✅ |
| **M3: Trajetos & Rotas** | Modelagem de rotas, pontos de partida/destino e trajeto | @Grazielly Sabino  | **Concluído** ✅ |
| **M4: Matching & Ciclo de Caronas** | Consultas espaciais (PostGIS), reserva de vagas, aceite/recusa | Equipe | **Em Andamento** 🚧 |
| **M5: Viagem & Avaliações** | Finalização de percurso, notas mútuas e histórico imutável | Equipe | **A Fazer** 📝 |

---

## 📋 Quadro Kanban Operacional

### 🚧 Em Andamento (Sprint Atual — Módulo 4: Matching & Gestão de Caronas)

#### ⚙️ Back-end (NestJS, Prisma & PostGIS) — @Guilherme Basilio & @Grazielly Sabino
- [ ] **Modelagem das entidades de Carona:** Criação das tabelas `Carona` e `SolicitacaoCarona` no Prisma com enums de status (`PENDENTE`, `ACEITO`, `RECUSADO`, `CANCELADO`).
- [ ] **Motor de Matching Geoespacial:** Implementação das queries espaciais no PostGIS para cruzar a rota do motorista com o ponto de embarque do passageiro (SLA de resposta $\le$ 5s).
- [ ] **Lógica de Gestão de Vagas:** Decremento automático de vagas disponíveis ao aceitar solicitação e bloqueio de novas reservas quando a capacidade for atingida.
- [ ] **Endpoints de Solicitação:** Rotas da API para solicitar carona, listar pedidos pendentes para o motorista e responder (aceitar/recusar).

#### 🎨 Front-end Mobile (React Native) — @Vinicius
- [ ] **Tela de Busca de Caronas:** Listagem de ofertas ativas com filtros por horário, destino e proximidade.
- [ ] **Card de Carona:** Exibição resumida com dados do condutor, veículo, vagas restantes e trajeto previsto.
- [ ] **Fluxo de Solicitação:** Ação de solicitar vaga e tela de acompanhamento do status do pedido (Pendente / Aprovado / Recusado).

---

### 📝 A Fazer (Próxima Etapa — Módulo 5: Finalização, Histórico & Avaliações)

#### ⚙️ Back-end
- [ ] Modelagem da entidade `Viagem` com regras de imutabilidade para fins de auditoria e segurança.
- [ ] Endpoints para iniciar e concluir viagens (atualização de status em tempo real).
- [ ] Módulo de avaliação mútua (notas de 1 a 5 e comentários entre motorista e passageiro).

#### 🎨 Front-end Mobile
- [ ] Tela de viagem em andamento para condutor e passageiros.
- [ ] Modal/Tela de feedback e avaliação após o término da corrida.
- [ ] Histórico de viagens realizadas na aba de perfil.

---

### 📌 Backlog (Refinamento & NFR)
- [ ] **Testes de Escalabilidade:** Validação de carga das consultas espaciais para suportar volume simultâneo.
- [ ] **Auditoria de Dados:** Políticas de restrição contra exclusão permanente de registros de viagens e solicitações.

---

### ✅ Concluído

#### 🚗 Gestão de Veículos & Rotas (Back-end) — @Guilherme Basilio / @Grazielly Sabino
- [x] **Modelagem `Veiculo` no Prisma:** Estrutura de dados para carros, placas e limite de assentos/capacidade.
- [x] **Endpoints de Veículos:** Criação, consulta e validação de vínculo do automóvel com o perfil de motorista.
- [x] **Modelagem de Rotas:** Estruturação dos dados de pontos de partida, paradas e destino no banco de dados.
- [x] **Endpoints de Trajetos:** Rotas de API para salvar e consultar itinerários dos motoristas.

#### 🚀 Autenticação, Cadastro & Infraestrutura —  @Guilherme / @Vinicius / @Grazielly Sabino
- [x] **Infraestrutura Containerizada:** Configuração do `docker-compose.yml` com PostgreSQL e extensão PostGIS ativa.
- [x] **Modelagem `Usuario` (Prisma):** Estrutura de dados com UUID, credenciais seguras e flags de validação.
- [x] **Back-end de Autenticação:** Endpoints de login e cadastro com hash seguro e emissão de tokens JWT.
- [x] **Validação Institucional:** Restrição de cadastro restrita ao domínio acadêmico (`@a.ucb.br`).
- [x] **Front-end de Autenticação:** Telas de login e cadastro integradas e operacionais no app móvel (@Vinicius).
- [x] **Documentação de Requisitos:** Especificação inicial do fluxo de cadastro e login levantada pela equipe (@Grazielly Sabino).
