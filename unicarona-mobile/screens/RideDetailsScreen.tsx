import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  ErrorState,
  Header,
  Loading,
  RouteLine,
  SectionTitle,
  StarRating,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';
import { formatarDataCompleta, formatarHora, formatarMoeda } from '../lib/format';
import { caronaService, chatService, solicitacaoService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';

const ROTULO_SOLICITACAO: Record<string, { texto: string; cor: string }> = {
  PENDENTE: { texto: 'Aguardando confirmação', cor: colors.orange },
  ACEITA: { texto: 'Confirmada', cor: colors.success },
  RECUSADA: { texto: 'Recusada', cor: colors.destructive },
  CANCELADA: { texto: 'Cancelada', cor: colors.mutedForeground },
};

export function RideDetailsScreen() {
  const { atual, voltar, navegar } = useNavigation();
  const caronaId: string = atual.params?.caronaId;

  const detalhe = useCarregar(() => caronaService.detalhe(caronaId), [caronaId]);
  const [acao, setAcao] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const executar = async (chave: string, tarefa: () => Promise<unknown>, sucesso?: string) => {
    setAcao(chave);
    setAviso(null);

    try {
      await tarefa();
      if (sucesso) setAviso(sucesso);
      await detalhe.recarregar();
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Não foi possível concluir a ação.');
    } finally {
      setAcao(null);
    }
  };

  const abrirConversa = async () => {
    if (!detalhe.dados) return;

    setAcao('chat');
    try {
      const { conversaId } = await chatService.abrir(detalhe.dados.motorista.id, caronaId);
      navegar('chat', { conversaId });
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Não foi possível abrir a conversa.');
    } finally {
      setAcao(null);
    }
  };

  if (detalhe.carregando) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Detalhes da carona" onVoltar={voltar} compacto />
        <Loading />
      </View>
    );
  }

  if (detalhe.erro || !detalhe.dados) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Detalhes da carona" onVoltar={voltar} compacto />
        <ErrorState mensagem={detalhe.erro ?? 'Carona indisponível.'} onTentarNovamente={detalhe.recarregar} />
      </View>
    );
  }

  const carona = detalhe.dados;
  const minha = carona.minhaSolicitacao;
  const pendentes = carona.solicitacoes.filter((s) => s.status === 'PENDENTE');
  const aceitas = carona.solicitacoes.filter((s) => s.status === 'ACEITA');

  return (
    <View style={estilos.tela}>
      <Header titulo="Detalhes da carona" onVoltar={voltar} compacto />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {aviso ? <Text style={estilos.aviso}>{aviso}</Text> : null}

        <Card style={estilos.cardMotorista}>
          <View style={estilos.motoristaLinha}>
            <Avatar nome={carona.motorista.nome} tamanho={62} />
            <View style={estilos.flex}>
              <Text style={estilos.motoristaNome}>{carona.motorista.nome}</Text>
              <StarRating
                nota={carona.motorista.avaliacaoMedia}
                sufixo={`(${carona.motorista.totalAvaliacoes} avaliações)`}
              />
              {carona.veiculo ? (
                <View style={estilos.veiculoLinha}>
                  <Icon name="car" size={13} color={colors.mutedForeground} />
                  <Text style={estilos.veiculoTexto}>
                    {carona.veiculo.modelo}
                    {carona.veiculo.cor ? ` • ${carona.veiculo.cor}` : ''} • {carona.veiculo.placa}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {!carona.souMotorista ? (
            <View style={estilos.acoesMotorista}>
              <Button
                label="Ver perfil"
                variante="contorno"
                icone="users"
                onPress={() => navegar('profile', { usuarioId: carona.motorista.id })}
                style={estilos.flex}
              />
              <Button
                label="Mensagem"
                variante="secundario"
                icone="message-circle"
                onPress={abrirConversa}
                carregando={acao === 'chat'}
                style={estilos.flex}
              />
            </View>
          ) : null}
        </Card>

        <Card>
          <SectionTitle>Trajeto</SectionTitle>
          <RouteLine
            origem={carona.origem.nome}
            destino={carona.destino.nome}
            detalheOrigem={carona.origem.endereco}
            detalheDestino={carona.destino.endereco}
          />

          <View style={estilos.infoGrade}>
            <InfoItem
              icone="calendar"
              label="Data"
              valor={formatarDataCompleta(carona.dataHoraPartida)}
            />
            <InfoItem icone="clock" label="Horário" valor={formatarHora(carona.dataHoraPartida)} />
            {carona.distanciaKm ? (
              <InfoItem icone="map-pin" label="Distância" valor={`${carona.distanciaKm} km`} />
            ) : null}
            <InfoItem
              icone="users"
              label="Vagas"
              valor={`${carona.vagasDisponiveis} de ${carona.vagasTotais}`}
            />
          </View>
        </Card>

        <Card>
          <View style={estilos.precoLinha}>
            <View>
              <Text style={estilos.precoLabel}>Preço por pessoa</Text>
              <Text style={estilos.precoValor}>{formatarMoeda(carona.precoPorPassageiro)}</Text>
            </View>
            {minha ? (
              <Badge cor={ROTULO_SOLICITACAO[minha.status].cor}>
                {ROTULO_SOLICITACAO[minha.status].texto}
              </Badge>
            ) : (
              <Badge cor={carona.status === 'ABERTA' ? colors.success : colors.mutedForeground}>
                {carona.status === 'ABERTA' ? 'Aberta' : carona.status.toLowerCase()}
              </Badge>
            )}
          </View>

          {carona.observacoes ? (
            <View style={estilos.observacoes}>
              <Text style={estilos.observacoesLabel}>Informações do motorista</Text>
              <Text style={estilos.observacoesTexto}>{carona.observacoes}</Text>
            </View>
          ) : null}

          {carona.preferencias.length > 0 ? (
            <View style={estilos.preferencias}>
              {carona.preferencias.map((preferencia) => (
                <Chip key={preferencia} label={preferencia} />
              ))}
            </View>
          ) : null}
        </Card>

        {aceitas.length > 0 ? (
          <Card>
            <SectionTitle>Passageiros confirmados</SectionTitle>
            <View style={estilos.listaPessoas}>
              {aceitas.map((solicitacao) => (
                <View key={solicitacao.id} style={estilos.pessoa}>
                  <Avatar nome={solicitacao.passageiro.nome} tamanho={40} cor={colors.navy} />
                  <View style={estilos.flex}>
                    <Text style={estilos.pessoaNome}>{solicitacao.passageiro.nome}</Text>
                    <Text style={estilos.pessoaDetalhe}>
                      {solicitacao.vagas} vaga(s)
                      {solicitacao.passageiro.curso ? ` • ${solicitacao.passageiro.curso}` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {carona.souMotorista && pendentes.length > 0 ? (
          <Card destacado>
            <SectionTitle>Solicitações pendentes</SectionTitle>
            <View style={estilos.listaPessoas}>
              {pendentes.map((solicitacao) => (
                <View key={solicitacao.id} style={estilos.solicitacao}>
                  <View style={estilos.pessoa}>
                    <Avatar nome={solicitacao.passageiro.nome} tamanho={40} />
                    <View style={estilos.flex}>
                      <Text style={estilos.pessoaNome}>{solicitacao.passageiro.nome}</Text>
                      <Text style={estilos.pessoaDetalhe}>{solicitacao.vagas} vaga(s)</Text>
                    </View>
                  </View>

                  {solicitacao.mensagem ? (
                    <Text style={estilos.mensagemSolicitacao}>{solicitacao.mensagem}</Text>
                  ) : null}

                  <View style={estilos.acoesSolicitacao}>
                    <Button
                      label="Recusar"
                      variante="contorno"
                      onPress={() =>
                        executar(
                          `recusar-${solicitacao.id}`,
                          () => solicitacaoService.responder(solicitacao.id, 'RECUSADA'),
                        )
                      }
                      carregando={acao === `recusar-${solicitacao.id}`}
                      style={estilos.flex}
                    />
                    <Button
                      label="Aceitar"
                      variante="secundario"
                      onPress={() =>
                        executar(
                          `aceitar-${solicitacao.id}`,
                          () => solicitacaoService.responder(solicitacao.id, 'ACEITA'),
                          'Vaga confirmada.',
                        )
                      }
                      carregando={acao === `aceitar-${solicitacao.id}`}
                      style={estilos.flex}
                    />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <Button
          label="Reportar um problema"
          variante="fantasma"
          icone="alert-circle"
          onPress={() => navegar('report', { caronaId })}
        />
      </ScrollView>

      <View style={estilos.rodape}>{renderizarAcaoPrincipal()}</View>
    </View>
  );

  function renderizarAcaoPrincipal() {
    if (carona.souMotorista) {
      return (
        <>
          <Button
            label="Concluir carona"
            variante="secundario"
            onPress={() =>
              executar('concluir', () => caronaService.concluir(caronaId), 'Carona concluída.')
            }
            carregando={acao === 'concluir'}
            disabled={carona.status !== 'ABERTA' && carona.status !== 'LOTADA'}
          />
          <Button
            label="Cancelar carona"
            variante="perigo"
            onPress={() =>
              executar('cancelar', () => caronaService.cancelar(caronaId), 'Carona cancelada.')
            }
            carregando={acao === 'cancelar'}
            disabled={carona.status === 'CANCELADA' || carona.status === 'CONCLUIDA'}
          />
        </>
      );
    }

    if (minha && (minha.status === 'PENDENTE' || minha.status === 'ACEITA')) {
      return (
        <Button
          label="Cancelar minha reserva"
          variante="perigo"
          onPress={() =>
            executar(
              'cancelar-reserva',
              () => solicitacaoService.cancelar(minha.id),
              'Reserva cancelada.',
            )
          }
          carregando={acao === 'cancelar-reserva'}
        />
      );
    }

    return (
      <Button
        label={carona.vagasDisponiveis > 0 ? 'Reservar vaga' : 'Sem vagas disponíveis'}
        variante="secundario"
        onPress={() =>
          executar(
            'reservar',
            () => solicitacaoService.criar(caronaId),
            'Solicitação enviada ao motorista.',
          )
        }
        carregando={acao === 'reservar'}
        disabled={carona.vagasDisponiveis === 0 || carona.status !== 'ABERTA'}
      />
    );
  }
}

function InfoItem({
  icone,
  label,
  valor,
}: {
  icone: 'calendar' | 'clock' | 'map-pin' | 'users';
  label: string;
  valor: string;
}) {
  return (
    <View style={estilos.infoItem}>
      <Icon name={icone} size={16} color={colors.mutedForeground} />
      <View>
        <Text style={estilos.infoLabel}>{label}</Text>
        <Text style={estilos.infoValor}>{valor}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  conteudo: { padding: spacing.xl, gap: spacing.lg },

  aviso: {
    ...typography.small,
    color: colors.navy,
    backgroundColor: colors.muted,
    padding: spacing.md,
    borderRadius: radius.sm,
  },

  cardMotorista: { gap: spacing.lg },
  motoristaLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  motoristaNome: { ...typography.title, color: colors.navy, marginBottom: 2 },
  veiculoLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  veiculoTexto: { ...typography.caption, color: colors.mutedForeground },
  acoesMotorista: { flexDirection: 'row', gap: spacing.md },

  infoGrade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: '42%' },
  infoLabel: { ...typography.caption, color: colors.mutedForeground },
  infoValor: { ...typography.smallMedium, color: colors.navy },

  precoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  precoLabel: { ...typography.caption, color: colors.mutedForeground },
  precoValor: { ...typography.h2, color: colors.orange },

  observacoes: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  observacoesLabel: { ...typography.caption, color: colors.mutedForeground, marginBottom: spacing.xs },
  observacoesTexto: { ...typography.small, color: colors.navy, lineHeight: 20 },

  preferencias: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },

  listaPessoas: { gap: spacing.lg },
  pessoa: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pessoaNome: { ...typography.smallMedium, color: colors.navy },
  pessoaDetalhe: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },

  solicitacao: { gap: spacing.md, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  mensagemSolicitacao: { ...typography.small, color: colors.mutedForeground, fontStyle: 'italic' },
  acoesSolicitacao: { flexDirection: 'row', gap: spacing.md },

  rodape: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
});
