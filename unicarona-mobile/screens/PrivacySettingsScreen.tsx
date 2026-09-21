import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Header, InfoBox, MenuItem, Screen, ToggleRow } from '../components/ui';
import { Icon, NomeIcone } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Privacidade e dados. As preferências ficam no aparelho: o backend
 * ainda não guarda flags de privacidade, e o perfil já controla o que é
 * exibido publicamente. Para persistir, criar um campo Json em Usuario e
 * enviar por PATCH /usuarios/me.
 */

interface Opcao {
  id: string;
  titulo: string;
  descricao: string;
  padrao: boolean;
  obrigatorio?: boolean;
}

const SECOES: { titulo: string; icone: NomeIcone; opcoes: Opcao[] }[] = [
  {
    titulo: 'Visibilidade do perfil',
    icone: 'eye',
    opcoes: [
      { id: 'foto', titulo: 'Foto do perfil visível', descricao: 'Outras pessoas podem ver sua foto.', padrao: true },
      { id: 'nome', titulo: 'Nome completo visível', descricao: 'Desligado, aparece só o primeiro nome.', padrao: false },
      { id: 'curso', titulo: 'Curso visível', descricao: 'Exibir seu curso no perfil.', padrao: true },
    ],
  },
  {
    titulo: 'Localização',
    icone: 'map-pin',
    opcoes: [
      {
        id: 'gps',
        titulo: 'Localização durante a carona',
        descricao: 'Necessária para calcular trajetos e distâncias.',
        padrao: true,
        obrigatorio: true,
      },
      { id: 'historico', titulo: 'Salvar rotas frequentes', descricao: 'Usado nas suas estatísticas.', padrao: true },
      { id: 'emergencia', titulo: 'Compartilhar com contatos de emergência', descricao: 'Em caso de alerta de SOS.', padrao: true },
    ],
  },
  {
    titulo: 'Comunicação',
    icone: 'message-circle',
    opcoes: [
      { id: 'telefone', titulo: 'Telefone visível após confirmação', descricao: 'Só para quem já está na carona.', padrao: true },
      { id: 'email', titulo: 'E-mail visível no perfil', descricao: 'Outras pessoas podem ver seu e-mail.', padrao: false },
      { id: 'mensagens', titulo: 'Guardar histórico de mensagens', descricao: 'Mantém o registro das conversas.', padrao: true },
    ],
  },
];

const INICIAIS = Object.fromEntries(
  SECOES.flatMap((secao) => secao.opcoes.map((opcao) => [opcao.id, opcao.padrao])),
);

export function PrivacySettingsScreen() {
  const { voltar, navegar } = useNavigation();
  const [valores, setValores] = useState<Record<string, boolean>>(INICIAIS);

  const alterar = (id: string, valor: boolean) =>
    setValores((atuais) => ({ ...atuais, [id]: valor }));

  return (
    <View style={estilos.tela}>
      <Header titulo="Privacidade e dados" onVoltar={voltar}>
        <View style={estilos.avisoHeader}>
          <Icon name="shield" size={20} color={colors.white} />
          <View style={estilos.flex}>
            <Text style={estilos.avisoTitulo}>Controle dos seus dados</Text>
            <Text style={estilos.avisoTexto}>
              Escolha o que fica visível e o que o app guarda sobre você.
            </Text>
          </View>
        </View>
      </Header>

      <Screen contentStyle={estilos.conteudo}>
        {SECOES.map((secao) => (
          <View key={secao.titulo} style={estilos.bloco}>
            <View style={estilos.tituloSecao}>
              <Icon name={secao.icone} size={18} color={colors.orange} />
              <Text style={estilos.tituloTexto}>{secao.titulo}</Text>
            </View>

            {secao.opcoes.map((opcao) => (
              <Card key={opcao.id}>
                {opcao.obrigatorio ? (
                  <View style={estilos.selo}>
                    <Text style={estilos.seloTexto}>Obrigatório</Text>
                  </View>
                ) : null}
                <ToggleRow
                  titulo={opcao.titulo}
                  descricao={opcao.descricao}
                  valor={opcao.obrigatorio ? true : valores[opcao.id]}
                  onChange={(valor) => !opcao.obrigatorio && alterar(opcao.id, valor)}
                />
              </Card>
            ))}
          </View>
        ))}

        <View style={estilos.bloco}>
          <Text style={estilos.tituloTexto}>Seus dados</Text>
          <View style={estilos.grupo}>
            <MenuItem
              titulo="Ver meu perfil completo"
              descricao="Tudo o que o app mostra sobre você"
              icone="users"
              onPress={() => navegar('profile')}
            />
            <MenuItem
              titulo="Denúncias enviadas"
              descricao="Acompanhe o que você reportou"
              icone="alert-circle"
              cor={colors.destructive}
              ultimo
              onPress={() => navegar('report')}
            />
          </View>
        </View>

        <InfoBox icone="lock">
          Estas preferências ficam salvas neste aparelho. Para excluir a conta ou solicitar seus
          dados, fale com a coordenação do projeto.
        </InfoBox>
      </Screen>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  avisoHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: tints.onNavy,
  },
  avisoTitulo: { ...typography.smallMedium, color: colors.white },
  avisoTexto: { ...typography.caption, color: tints.onNavyText, marginTop: 2 },

  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  bloco: { gap: spacing.md },
  tituloSecao: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tituloTexto: { ...typography.title, color: colors.navy },

  selo: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.orange,
  },
  seloTexto: { ...typography.caption, fontWeight: '700', color: colors.white },

  grupo: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
