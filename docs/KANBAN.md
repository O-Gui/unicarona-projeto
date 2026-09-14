# 🚗 UniCarona — Acompanhamento e Metodologia

Quadro de fluxo contínuo (Kanban) e Roadmap de desenvolvimento do sistema de caronas universitárias UniCarona.

---

## 👥 Atribuições da Equipe
* **Back-end & Geoprocessamento (PostGIS / Prisma):** @Guilherme Basilio
* **Front-end Mobile (React Native):** @Vinicius /  @Grazielly Sabino
* **Requisitos, Documentação & QA:** @Grazielly Sabino

---

## 🗺️ Roadmap de Módulos (Visão Geral)

| Módulo | Escopo & Regras de Negócio | Responsável Principal | Status |
| :--- | :--- | :---: | :---: |
| **M1: Autenticação & Usuários** | Cadastro institucional (`@a.ucb.br`), tokens JWT e validação | @Guilherme / @Vinicius | **Concluído** ✅ |
| **M2: Gestão de Veículos** | Cadastro de veículos, placas e capacidade (1 a 4 vagas) | @Guilherme / @Vinicius / @Grazielly Sabino | **Em Andamento** 🚧 |
| **M3: Trajetos & Geoespacial** | Modelagem de rotas, integração PostGIS e matching de proximidade |  @Guilherme / @Vinicius / @Grazielly Sabino | **Em Andamento** 🚧 |
| **M4: Ciclo de Vida da Carona** | Oferta de vagas, busca por proximidade, solicitação e aceite |  @Guilherme / @Vinicius / @Grazielly Sabino | **A Fazer** 📝 |
| **M5: Viagem & Avaliações** | Finalização de percurso, notas mútuas e histórico imutável | @Guilherme / @Vinicius / @Grazielly Sabino| **Backlog** 📌 |

---

## 📋 Quadro Kanban Operacional

### 🚧 Em Andamento (Sprint Atual — Veículos, Rotas & Matching)

#### ⚙️ Back-end & Banco de Dados — @Guilherme Basilio
- [ ] **Modelagem `Veiculo` no Prisma:** Criação da tabela, relações com `Usuario` e validações de capacidade.
- [ ] **Modelagem `Rota` com PostGIS:** Estruturação de campos de geometria/geografia para pontos de partida, destino e trajeto.
- [ ] **Motor de Matching Geoespacial:** Implementação das queries espaciais no PostgreSQL para cruzamento de rotas e pontos de encontro (otimizadas para responder no SLA de até 5s).
- [ ] **Endpoints de Trajetos:** Rotas de API para criação, consulta e atualização de trajetos cadastrados.

#### 🎨 Front-end Mobile — @Vinicius / @Grazielly Sabino
- [ ] **Tela de Cadastro de Veículo:** Formulário para condutores registrarem modelo, placa e quantidade de assentos disponíveis.
- [ ] **Interface de Definição de Rota:** Componente com mapa mobile para seleção de ponto de partida, destino e paradas.
- [ ] **Listagem de Trajetos do Motorista:** Visualização das rotas ativas cadastradas pelo condutor.

---

### 📝 A Fazer (Próxima Etapa — Módulo 4: Gestão de Caronas)

#### ⚙️ Back-end & Regras de Negócio
- [ ] Modelagem das tabelas `Carona` e `SolicitacaoCarona` (controle de status: pendente, aceito, recusado, cancelado).
- [ ] Lógica de decremento automático de vagas ao aceitar um passageiro.
- [ ] Bloqueio de novas solicitações caso a capacidade do veículo seja atingida.

#### 🎨 Front-end Mobile
- [ ] Tela de busca de caronas com filtro por horário e proximidade geográfica.
- [ ] Card de carona com exibição de condutor, vagas restantes e trajeto previsto.
- [ ] Botão de solicitação de carona e tela de notificações de aceite/recusa.

---

### 📌 Backlog (Módulo 5: Histórico, Auditoria & NFR)
- [ ] **Histórico Imutável:** Modelagem da entidade `Viagem` com restrições de exclusão para fins de auditoria.
- [ ] **Sistema de Reputação:** Módulo de avaliação mútua (notas de 1 a 5 e comentários entre motorista e passageiro).
- [ ] **Testes de Carga & Escalabilidade:** Validação do banco e das rotas para suportar até 3.000 usuários simultâneos.

---

### ✅ Concluído

#### 🚀 Autenticação, Cadastro & Infraestrutura
- [x] **Infraestrutura Containerizada:** Configuração do `docker-compose.yml` com PostgreSQL e extensão PostGIS ativa.
- [x] **Modelagem `Usuario` (Prisma):** Estrutura de dados com UUID, nome, credenciais seguras e flags de validação.
- [x] **Back-end de Autenticação:** Endpoints de cadastro e login com hash seguro e emissão de tokens JWT (`feat: implement authentication and registration`).
- [x] **Validação Institucional:** Regra de negócio limitando o acesso a e-mails acadêmicos (`@a.ucb.br`).
- [x] **Front-end Mobile (Autenticação):** Telas de login e cadastro totalmente integradas e funcionais no app móvel.
- [x] **Documentação de Requisitos:** Especificação inicial do fluxo de cadastro e login levantada pela equipe.
