import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Header,
  InfoBox,
  Loading,
  RouteLine,
  SectionTitle,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { formatarData, formatarHora } from '../lib/format';
import { caronaService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useAuth } from '../state/AuthContext';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Caronas em grupo. O backend não tem entidade "grupo": aqui uma carona
 * em grupo é simplesmente uma carona com várias vagas. A tela reúne as suas
 * caronas com mais de duas vagas e mostra quem já está confirmado.
 */
export function GroupRideScreen() {
  const { voltar, navegar } = useNavigation();
  const { usuario } = useAuth();

  const minhas = useCarregar(() => caronaService.minhas(), []);

  const todas = [...(minhas.dados?.oferecidas ?? []), ...(minhas.dados?.reservadas ?? [])];
  const emGrupo = todas.filter(
    (carona) => carona.vagasTotais >= 3 && carona.status !== 'CANCELADA',
  );

  const pessoas = emGrupo.flatMap((carona) => [carona.motorista, ...carona.passageiros]);
  const unicas = pessoas.filter(
    (pessoa, indice) => pessoas.findIndex((outra) => outra.id === pessoa.id) === indice,
  );

  return (
    <View style={estilos.tela}>
      <Header titulo="Caronas em grupo" onVoltar={voltar}>
        <View style={estilos.cartaoGrupo}>
          <View style={estilos.grupoTopo}>
            <View style={estilos.flex}>
              <Text style={estilos.grupoTitulo}>Sua turma de caronas</Text>
              <Text style={estilos.grupoSubtitulo}>
                {unicas.length} pessoa(s) nas suas caronas com 3 vagas ou mais
              </Text>
            </View>
            <Icon name="users" size={22} color={colors.white} />
          </View>

          {unicas.length > 0 ? (
            <View style={estilos.avatares}>
              {unicas.slice(0, 5).map((pessoa) => (
                <Avatar key={pessoa.id} nome={pessoa.nome} tamanho={32} />
              ))}
              {unicas.length > 5 ? (
                <Text style={estilos.maisPessoas}>+{unicas.length - 5}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </Header>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.atalhos}>
          <Card style={estilos.atalho} onPress={() => navegar('offer-ride')}>
            <Icon name="car" size={24} color={colors.orange} />
            <Text style={estilos.atalhoTexto}>Criar carona em grupo</Text>
            <Text style={estilos.atalhoDetalhe}>Publique com 3 vagas ou mais</Text>
          </Card>

          <Card style={estilos.atalho} onPress={() => navegar('find-ride')}>
            <Icon name="search" size={24} color={colors.navy} />
            <Text style={estilos.atalhoTexto}>Entrar em uma</Text>
            <Text style={estilos.atalhoDetalhe}>Busque caronas com vagas livres</Text>
          </Card>
        </View>

        <View style={estilos.bloco}>
          <SectionTitle>Suas caronas em grupo</SectionTitle>

          {minhas.carregando ? (
            <Loading />
          ) : minhas.erro ? (
            <ErrorState mensagem={minhas.erro} onTentarNovamente={minhas.recarregar} />
          ) : emGrupo.length === 0 ? (
            <EmptyState
              icone="users"
              titulo="Nenhuma carona em grupo"
              descricao="Publique uma carona com 3 vagas ou mais e ela aparece aqui."
              acao="Oferecer carona"
              onAcao={() => navegar('offer-ride')}
            />
          ) : (
            emGrupo.map((carona) => {
              const souMotorista = carona.motorista.id === usuario?.id;

              return (
                <Card
                  key={carona.id}
                  style={estilos.cartao}
                  onPress={() => navegar('ride-details', { caronaId: carona.id })}
                >
                  <View style={estilos.cartaoTopo}>
                    <Text style={estilos.quando}>
                      {formatarData(carona.dataHoraPartida)} • {formatarHora(carona.dataHoraPartida)}
                    </Text>
                    <Badge cor={souMotorista ? colors.orange : colors.navy}>
                      {souMotorista ? 'Você dirige' : 'Você vai junto'}
                    </Badge>
                  </View>

                  <RouteLine origem={carona.origem.nome} destino={carona.destino.nome} compacto />

                  <View style={estilos.participantes}>
                    {[carona.motorista, ...carona.passageiros].slice(0, 6).map((pessoa) => (
                      <View key={pessoa.id} style={estilos.participante}>
                        <Avatar
                          nome={pessoa.nome}
                          tamanho={28}
                          cor={pessoa.id === carona.motorista.id ? colors.orange : colors.navy}
                        />
                        <Text style={estilos.participanteNome} numberOfLines={1}>
                          {pessoa.nome.split(' ')[0]}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={estilos.cartaoRodape}>
                    <Text style={estilos.detalhe}>
                      {carona.vagasTotais - carona.vagasDisponiveis} de {carona.vagasTotais} vagas
                      ocupadas
                    </Text>
                    <Button
                      label="Conversar"
                      variante="contorno"
                      icone="message-circle"
                      onPress={() =>
                        navegar('chat', {
                          destinatarioId: souMotorista
                            ? carona.passageiros[0]?.id
                            : carona.motorista.id,
                          caronaId: carona.id,
                        })
                      }
                      style={estilos.botaoConversar}
                    />
                  </View>
                </Card>
              );
            })
          )}
        </View>

        <InfoBox icone="users">
          Grupos fixos (turma, laboratório, república) ainda não existem no servidor. Por enquanto,
          uma carona com muitas vagas cumpre o mesmo papel.
        </InfoBox>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  cartaoGrupo: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: tints.onNavy,
    gap: spacing.md,
  },
  grupoTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  grupoTitulo: { ...typography.bodyMedium, color: colors.white },
  grupoSubtitulo: { ...typography.caption, color: tints.onNavyText, marginTop: 2 },
  avatares: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  maisPessoas: { ...typography.caption, color: tints.onNavyText, marginLeft: spacing.xs },

  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },

  atalhos: { flexDirection: 'row', gap: spacing.md },
  atalho: { flex: 1, gap: spacing.xs },
  atalhoTexto: { ...typography.smallMedium, color: colors.navy },
  atalhoDetalhe: { ...typography.caption, color: colors.mutedForeground },

  bloco: { gap: spacing.md },
  cartao: { gap: spacing.md },
  cartaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  quando: { ...typography.caption, color: colors.mutedForeground },

  participantes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  participante: { alignItems: 'center', gap: spacing.xs, width: 56 },
  participanteNome: { ...typography.caption, color: colors.mutedForeground },

  cartaoRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detalhe: { ...typography.caption, color: colors.mutedForeground, flex: 1 },
  botaoConversar: { minHeight: 38, paddingHorizontal: spacing.lg },
});
