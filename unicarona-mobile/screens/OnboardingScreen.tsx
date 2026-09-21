import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, NomeIcone } from '../components/Icon';
import { Button, Card, IconBubble } from '../components/ui';
import { colors, radius, spacing, tints, typography } from '../theme';
import { useNavigation } from '../state/NavigationContext';

const RECURSOS: { icone: NomeIcone; titulo: string; descricao: string; cor: string }[] = [
  {
    icone: 'car',
    titulo: 'Caronas seguras',
    descricao: 'Conecte-se com colegas da sua universidade de forma verificada e confiável.',
    cor: colors.orange,
  },
  {
    icone: 'shield',
    titulo: 'Verificação acadêmica',
    descricao: 'Todos os usuários passam por e-mail institucional e envio de documentos.',
    cor: colors.navy,
  },
  {
    icone: 'users',
    titulo: 'Comunidade universitária',
    descricao: 'Compartilhe trajetos com estudantes e professores do seu campus.',
    cor: colors.orange,
  },
  {
    icone: 'leaf',
    titulo: 'Economize e ajude o planeta',
    descricao: 'Reduza custos de transporte e pegada de carbono junto com a turma.',
    cor: colors.navy,
  },
];

export function OnboardingScreen() {
  const { substituir } = useNavigation();

  return (
    <View style={estilos.tela}>
      <View style={estilos.hero}>
        <View style={estilos.marca}>
          <Icon name="car" size={38} color={colors.white} />
        </View>
        <Text style={estilos.heroTitulo}>UniCarona</Text>
        <Text style={estilos.heroSubtitulo}>A rede de caronas da sua universidade</Text>
      </View>

      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {RECURSOS.map((recurso) => (
          <Card key={recurso.titulo} style={estilos.cardRecurso}>
            <View style={estilos.linhaRecurso}>
              <IconBubble nome={recurso.icone} cor={recurso.cor} tamanho={46} />
              <View style={estilos.textoRecurso}>
                <Text style={estilos.recursoTitulo}>{recurso.titulo}</Text>
                <Text style={estilos.recursoDescricao}>{recurso.descricao}</Text>
              </View>
            </View>
          </Card>
        ))}

        <View style={estilos.numeros}>
          <Text style={estilos.numerosTitulo}>Junte-se a milhares de universitários</Text>
          <View style={estilos.numerosLinha}>
            <Numero valor="50K+" label="Usuários" cor={colors.orange} />
            <Numero valor="200+" label="Universidades" cor={colors.navy} />
            <Numero valor="1M+" label="Caronas" cor={colors.orange} />
          </View>
        </View>
      </ScrollView>

      <View style={estilos.rodape}>
        <Button
          label="Começar"
          variante="secundario"
          iconeDireita="chevron-right"
          onPress={() => substituir('login')}
        />
        <Text style={estilos.termos}>
          Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.
        </Text>
      </View>
    </View>
  );
}

function Numero({ valor, label, cor }: { valor: string; label: string; cor: string }) {
  return (
    <View style={estilos.numero}>
      <Text style={[estilos.numeroValor, { color: cor }]}>{valor}</Text>
      <Text style={estilos.numeroLabel}>{label}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.navy,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  marca: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitulo: { ...typography.h1, color: colors.white },
  heroSubtitulo: { ...typography.small, color: tints.onNavyText, marginTop: spacing.xs },

  conteudo: { padding: spacing.xl, gap: spacing.md },
  cardRecurso: { padding: spacing.lg },
  linhaRecurso: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  textoRecurso: { flex: 1 },
  recursoTitulo: { ...typography.title, color: colors.navy, marginBottom: spacing.xs },
  recursoDescricao: { ...typography.small, color: colors.mutedForeground, lineHeight: 19 },

  numeros: {
    marginTop: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: tints.orange,
    borderWidth: 1,
    borderColor: 'rgba(242, 140, 24, 0.25)',
  },
  numerosTitulo: {
    ...typography.smallMedium,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  numerosLinha: { flexDirection: 'row' },
  numero: { flex: 1, alignItems: 'center' },
  numeroValor: { ...typography.h2 },
  numeroLabel: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },

  rodape: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  termos: { ...typography.caption, color: colors.mutedForeground, textAlign: 'center', lineHeight: 16 },
});
