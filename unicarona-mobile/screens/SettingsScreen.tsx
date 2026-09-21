import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, Header, MenuItem, Screen } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';
import { useAuth } from '../state/AuthContext';
import { useNavigation } from '../state/NavigationContext';
import type { Rota } from '../state/NavigationContext';
import type { NomeIcone } from '../components/Icon';

/**
 * UC — Configurações (aba "Mais" da barra inferior). É o índice de tudo que
 * não cabe nas outras três abas.
 */

interface ItemMenu {
  titulo: string;
  icone: NomeIcone;
  cor?: string;
  rota?: Rota;
  aviso?: string;
}

const SECOES: { titulo: string; itens: ItemMenu[] }[] = [
  {
    titulo: 'CONTA',
    itens: [
      { titulo: 'Informações pessoais', icone: 'users', rota: 'profile' },
      { titulo: 'Meu veículo', icone: 'car', cor: colors.orange, rota: 'car' },
      { titulo: 'Métodos de pagamento', icone: 'credit-card', rota: 'payment-methods' },
      { titulo: 'Carteira', icone: 'dollar-sign', cor: colors.orange, rota: 'wallet' },
    ],
  },
  {
    titulo: 'ATIVIDADE',
    itens: [
      { titulo: 'Notificações', icone: 'bell', cor: colors.orange, rota: 'notifications' },
      { titulo: 'Minhas estatísticas', icone: 'trending-up', rota: 'analytics' },
      { titulo: 'Mapa do campus', icone: 'map-pin', cor: colors.orange, rota: 'campus-map' },
      { titulo: 'Caronas em grupo', icone: 'users', rota: 'group-ride' },
    ],
  },
  {
    titulo: 'SEGURANÇA',
    itens: [
      { titulo: 'Privacidade', icone: 'lock', rota: 'privacy-settings' },
      { titulo: 'Emergência e SOS', icone: 'alert-circle', cor: colors.destructive, rota: 'emergency' },
      { titulo: 'Denunciar um problema', icone: 'help-circle', rota: 'report' },
    ],
  },
];

export function SettingsScreen() {
  const { usuario, sair } = useAuth();
  const { navegar, reiniciar } = useNavigation();
  const [saindo, setSaindo] = useState(false);

  const confirmarSaida = () => {
    Alert.alert('Sair da conta', 'Você precisará entrar novamente para usar o app.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setSaindo(true);
          await sair();
          reiniciar('login');
        },
      },
    ]);
  };

  return (
    <View style={estilos.tela}>
      <Header titulo="Configurações" />

      <Screen contentStyle={estilos.conteudo}>
        <Card onPress={() => navegar('profile')} style={estilos.perfil}>
          <Avatar nome={usuario?.nome} tamanho={60} />
          <View style={estilos.flex}>
            <Text style={estilos.perfilNome} numberOfLines={1}>
              {usuario?.nome ?? 'Minha conta'}
            </Text>
            <Text style={estilos.perfilEmail} numberOfLines={1}>
              {usuario?.email}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.mutedForeground} />
        </Card>

        {SECOES.map((secao) => (
          <View key={secao.titulo} style={estilos.secao}>
            <Text style={estilos.secaoTitulo}>{secao.titulo}</Text>
            <View style={estilos.grupo}>
              {secao.itens.map((item, indice) => (
                <MenuItem
                  key={item.titulo}
                  titulo={item.titulo}
                  icone={item.icone}
                  cor={item.cor}
                  ultimo={indice === secao.itens.length - 1}
                  onPress={() => item.rota && navegar(item.rota)}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={estilos.versao}>
          <Text style={estilos.versaoNome}>UniCarona</Text>
          <Text style={estilos.versaoTexto}>Versão 1.0.0</Text>
        </View>

        <Button
          label="Sair da conta"
          variante="perigo"
          icone="log-out"
          carregando={saindo}
          onPress={confirmarSaida}
        />
      </Screen>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },

  perfil: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  perfilNome: { ...typography.title, color: colors.navy },
  perfilEmail: { ...typography.small, color: colors.mutedForeground },

  secao: { gap: spacing.sm },
  secaoTitulo: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.mutedForeground,
    letterSpacing: 0.6,
    paddingHorizontal: spacing.sm,
  },
  grupo: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  versao: { alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.muted },
  versaoNome: { ...typography.bodyMedium, color: colors.navy },
  versaoTexto: { ...typography.caption, color: colors.mutedForeground },
});
