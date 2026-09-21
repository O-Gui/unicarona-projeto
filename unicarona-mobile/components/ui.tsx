import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Icon, NomeIcone } from './Icon';
import { colors, radius, shadow, spacing, tints, typography } from '../theme';
import { iniciais } from '../lib/format';

/**
 * Primitivas do design system. Reproduzem os blocos que se repetem no
 * protótipo web: cabeçalho navy, cartões brancos com borda, botões cheios,
 * campos com ícone à esquerda, avatares com iniciais e a linha de trajeto.
 */

/* ------------------------------------------------------------------ Layout */

export function Screen({
  children,
  scroll = true,
  style,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  if (!scroll) {
    return <View style={[estilos.tela, style]}>{children}</View>;
  }

  return (
    <View style={[estilos.tela, style]}>
      <ScrollView
        contentContainerStyle={[estilos.conteudoScroll, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/** Cabeçalho navy com botão voltar — presente em quase toda tela interna. */
export function Header({
  titulo,
  onVoltar,
  acao,
  children,
  compacto = false,
}: {
  titulo?: string;
  onVoltar?: () => void;
  acao?: React.ReactNode;
  children?: React.ReactNode;
  compacto?: boolean;
}) {
  return (
    <View style={[estilos.header, compacto && estilos.headerCompacto]}>
      <View style={estilos.headerLinha}>
        {onVoltar ? (
          <Pressable onPress={onVoltar} hitSlop={12} style={estilos.headerBotao}>
            <Icon name="arrow-left" size={24} color={colors.white} />
          </Pressable>
        ) : null}
        {titulo ? <Text style={estilos.headerTitulo}>{titulo}</Text> : null}
        <View style={estilos.flex} />
        {acao}
      </View>
      {children}
    </View>
  );
}

/** Seta de voltar sobre fundo claro (telas de cadastro e verificação). */
export function BackButton({
  onPress,
  cor = colors.navy,
  label,
}: {
  onPress: () => void;
  cor?: string;
  label?: string;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={estilos.voltar} accessibilityRole="button">
      <Icon name="arrow-left" size={24} color={cor} />
      {label ? <Text style={[estilos.voltarLabel, { color: cor }]}>{label}</Text> : null}
    </Pressable>
  );
}

export function SectionTitle({
  children,
  acao,
  onAcao,
}: {
  children: React.ReactNode;
  acao?: string;
  onAcao?: () => void;
}) {
  return (
    <View style={estilos.secaoLinha}>
      <Text style={estilos.secaoTitulo}>{children}</Text>
      {acao ? (
        <Pressable onPress={onAcao} hitSlop={8}>
          <Text style={estilos.secaoAcao}>{acao}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  onPress,
  style,
  destacado = false,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  destacado?: boolean;
}) {
  const conteudo = <View style={[estilos.card, destacado && estilos.cardDestacado, style]}>{children}</View>;

  if (!onPress) return conteudo;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? estilos.pressionado : undefined)}>
      {conteudo}
    </Pressable>
  );
}

/** Barra fixa no rodapé onde ficam as ações principais da tela. */
export function BottomBar({ children }: { children: React.ReactNode }) {
  return <View style={estilos.barraInferior}>{children}</View>;
}

/* ----------------------------------------------------------------- Botões */

type VarianteBotao = 'primario' | 'secundario' | 'contorno' | 'perigo' | 'fantasma';

export function Button({
  label,
  onPress,
  variante = 'primario',
  icone,
  iconeDireita,
  carregando = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  icone?: NomeIcone;
  iconeDireita?: NomeIcone;
  carregando?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inativo = disabled || carregando;
  const corTexto =
    variante === 'contorno' ? colors.navy : variante === 'perigo' ? colors.destructive : colors.white;
  const corTextoFinal = variante === 'fantasma' ? colors.orange : corTexto;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      style={({ pressed }) => [
        estilos.botao,
        variante === 'primario' && { backgroundColor: colors.navy },
        variante === 'secundario' && { backgroundColor: colors.orange },
        variante === 'contorno' && estilos.botaoContorno,
        variante === 'perigo' && estilos.botaoPerigo,
        variante === 'fantasma' && estilos.botaoFantasma,
        pressed && !inativo && estilos.pressionado,
        inativo && estilos.desabilitado,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTextoFinal} />
      ) : (
        <>
          {icone ? <Icon name={icone} size={18} color={corTextoFinal} /> : null}
          <Text style={[estilos.botaoTexto, { color: corTextoFinal }]}>{label}</Text>
          {iconeDireita ? <Icon name={iconeDireita} size={18} color={corTextoFinal} /> : null}
        </>
      )}
    </Pressable>
  );
}

/* ---------------------------------------------------------------- Entradas */

interface FieldProps extends TextInputProps {
  label?: string;
  icone?: NomeIcone;
  iconeDireita?: NomeIcone;
  onIconeDireita?: () => void;
  ajuda?: string;
  erro?: string;
  /** Marcador redondo laranja usado nos campos de origem do trajeto. */
  marcador?: boolean;
}

export function Field({
  label,
  icone,
  iconeDireita,
  onIconeDireita,
  ajuda,
  erro,
  marcador,
  style,
  ...props
}: FieldProps) {
  return (
    <View style={estilos.campo}>
      {label ? <Text style={estilos.campoLabel}>{label}</Text> : null}
      <View style={[estilos.campoCaixa, !!erro && estilos.campoCaixaErro]}>
        {marcador ? <View style={estilos.marcadorOrigem} /> : null}
        {icone ? <Icon name={icone} size={18} color={colors.mutedForeground} /> : null}
        <TextInput
          placeholderTextColor="#A9B6C2"
          style={[estilos.campoInput, style]}
          {...props}
        />
        {iconeDireita ? (
          <Pressable onPress={onIconeDireita} hitSlop={10}>
            <Icon name={iconeDireita} size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
      {erro ? <Text style={estilos.campoErro}>{erro}</Text> : null}
      {!erro && ajuda ? <Text style={estilos.campoAjuda}>{ajuda}</Text> : null}
    </View>
  );
}

export function TextArea({ label, ajuda, ...props }: FieldProps) {
  return (
    <View style={estilos.campo}>
      {label ? <Text style={estilos.campoLabel}>{label}</Text> : null}
      <TextInput
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor="#A9B6C2"
        style={estilos.textArea}
        {...props}
      />
      {ajuda ? <Text style={estilos.campoAjuda}>{ajuda}</Text> : null}
    </View>
  );
}

export function Checkbox({
  marcado,
  onToggle,
  children,
}: {
  marcado: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable onPress={onToggle} style={estilos.checkboxLinha} accessibilityRole="checkbox">
      <View style={[estilos.checkboxCaixa, marcado && estilos.checkboxMarcado]}>
        {marcado ? <Icon name="check" size={14} color={colors.white} /> : null}
      </View>
      <View style={estilos.flex}>{children}</View>
    </Pressable>
  );
}

export function ToggleRow({
  titulo,
  descricao,
  valor,
  onChange,
}: {
  titulo: string;
  descricao?: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
}) {
  return (
    <View style={estilos.toggleLinha}>
      <View style={estilos.flex}>
        <Text style={estilos.toggleTitulo}>{titulo}</Text>
        {descricao ? <Text style={estilos.toggleDescricao}>{descricao}</Text> : null}
      </View>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.orange }}
        thumbColor={colors.white}
      />
    </View>
  );
}

/** Seletor de opção única em linha (vagas, filtros, abas). */
export function OptionRow<T extends string | number>({
  opcoes,
  valor,
  onChange,
  rotulo,
}: {
  opcoes: T[];
  valor: T | null;
  onChange: (opcao: T) => void;
  rotulo?: (opcao: T) => string;
}) {
  return (
    <View style={estilos.opcoesLinha}>
      {opcoes.map((opcao) => {
        const ativo = opcao === valor;
        return (
          <Pressable
            key={String(opcao)}
            onPress={() => onChange(opcao)}
            style={[estilos.opcao, ativo && estilos.opcaoAtiva]}
          >
            <Text style={[estilos.opcaoTexto, ativo && estilos.opcaoTextoAtivo]}>
              {rotulo ? rotulo(opcao) : String(opcao)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------- Indicadores */

export function Avatar({
  nome,
  tamanho = 48,
  cor = colors.orange,
}: {
  nome?: string | null;
  tamanho?: number;
  cor?: string;
}) {
  return (
    <View
      style={[
        estilos.avatar,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: cor },
      ]}
    >
      <Text style={[estilos.avatarTexto, { fontSize: tamanho * 0.38 }]}>{iniciais(nome)}</Text>
    </View>
  );
}

export function Badge({
  children,
  cor = colors.orange,
  fundo,
}: {
  children: React.ReactNode;
  cor?: string;
  fundo?: string;
}) {
  return (
    <View style={[estilos.badge, { backgroundColor: fundo ?? `${cor}1F` }]}>
      <Text style={[estilos.badgeTexto, { color: cor }]}>{children}</Text>
    </View>
  );
}

export function Chip({
  label,
  ativo = false,
  onPress,
}: {
  label: string;
  ativo?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[estilos.chip, ativo && estilos.chipAtivo]}
    >
      <Text style={[estilos.chipTexto, ativo && estilos.chipTextoAtivo]}>{label}</Text>
    </Pressable>
  );
}

/** Ícone circular com fundo translúcido — usado em cards e listas. */
export function IconBubble({
  nome,
  cor = colors.orange,
  tamanho = 40,
}: {
  nome: NomeIcone;
  cor?: string;
  tamanho?: number;
}) {
  return (
    <View
      style={[
        estilos.bolha,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          backgroundColor: `${cor}1F`,
        },
      ]}
    >
      <Icon name={nome} size={tamanho * 0.45} color={cor} />
    </View>
  );
}

export function StarRating({
  nota,
  tamanho = 14,
  onChange,
  mostrarNumero = true,
  sufixo,
}: {
  nota: number;
  tamanho?: number;
  onChange?: (nota: number) => void;
  mostrarNumero?: boolean;
  sufixo?: string;
}) {
  const estrelas = [1, 2, 3, 4, 5];

  if (onChange) {
    return (
      <View style={estilos.estrelasLinha}>
        {estrelas.map((valor) => (
          <Pressable key={valor} onPress={() => onChange(valor)} hitSlop={6}>
            <Icon
              name={valor <= nota ? 'star' : 'star-outline'}
              size={tamanho}
              color={valor <= nota ? colors.orange : colors.border}
            />
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={estilos.estrelasLinhaCompacta}>
      <Icon name="star" size={tamanho} color={colors.orange} />
      {mostrarNumero ? (
        <Text style={estilos.notaTexto}>{nota > 0 ? nota.toFixed(1) : '—'}</Text>
      ) : null}
      {sufixo ? <Text style={estilos.notaSufixo}>{sufixo}</Text> : null}
    </View>
  );
}

/** Origem → destino com o traço vertical do protótipo. */
export function RouteLine({
  origem,
  destino,
  detalheOrigem,
  detalheDestino,
  compacto = false,
}: {
  origem: string;
  destino: string;
  detalheOrigem?: string | null;
  detalheDestino?: string | null;
  compacto?: boolean;
}) {
  if (compacto) {
    return (
      <View style={estilos.trajetoCompacto}>
        <View style={estilos.trajetoPonta}>
          <View style={estilos.pontoOrigem} />
          <Text style={estilos.trajetoTextoCompacto} numberOfLines={1}>
            {origem}
          </Text>
        </View>
        <View style={estilos.trajetoTraco} />
        <View style={[estilos.trajetoPonta, estilos.trajetoPontaFim]}>
          <Icon name="map-pin" size={14} color={colors.navy} />
          <Text style={estilos.trajetoTextoCompacto} numberOfLines={1}>
            {destino}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={estilos.trajeto}>
      <View style={estilos.trajetoColuna}>
        <View style={estilos.pontoOrigemVazado} />
        <View style={estilos.trajetoLinhaVertical} />
        <Icon name="map-pin" size={14} color={colors.navy} />
      </View>
      <View style={estilos.flex}>
        <View style={estilos.trajetoBloco}>
          <Text style={estilos.trajetoTitulo}>{origem}</Text>
          {detalheOrigem ? <Text style={estilos.trajetoDetalhe}>{detalheOrigem}</Text> : null}
        </View>
        <View>
          <Text style={estilos.trajetoTitulo}>{destino}</Text>
          {detalheDestino ? <Text style={estilos.trajetoDetalhe}>{detalheDestino}</Text> : null}
        </View>
      </View>
    </View>
  );
}

export function StatCard({
  valor,
  label,
  icone,
  cor = colors.orange,
}: {
  valor: string | number;
  label: string;
  icone?: NomeIcone;
  cor?: string;
}) {
  return (
    <View style={estilos.statCard}>
      {icone ? <Icon name={icone} size={20} color={cor} /> : null}
      <Text style={estilos.statValor}>{valor}</Text>
      <Text style={estilos.statLabel}>{label}</Text>
    </View>
  );
}

/** Cartão de estatística sobre o cabeçalho navy. */
export function HeaderStat({ valor, label }: { valor: string | number; label: string }) {
  return (
    <View style={estilos.headerStat}>
      <Text style={estilos.headerStatLabel}>{label}</Text>
      <Text style={estilos.headerStatValor}>{valor}</Text>
    </View>
  );
}

export function MenuItem({
  titulo,
  descricao,
  icone,
  cor = colors.navy,
  onPress,
  ultimo = false,
  direita,
}: {
  titulo: string;
  descricao?: string;
  icone: NomeIcone;
  cor?: string;
  onPress?: () => void;
  ultimo?: boolean;
  direita?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        estilos.menuItem,
        !ultimo && estilos.menuItemBorda,
        pressed && estilos.pressionado,
      ]}
    >
      <Icon name={icone} size={20} color={cor} />
      <View style={estilos.flex}>
        <Text style={estilos.menuTitulo}>{titulo}</Text>
        {descricao ? <Text style={estilos.menuDescricao}>{descricao}</Text> : null}
      </View>
      {direita ?? <Icon name="chevron-right" size={20} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export function EmptyState({
  icone = 'bell',
  titulo,
  descricao,
  acao,
  onAcao,
}: {
  icone?: NomeIcone;
  titulo: string;
  descricao?: string;
  acao?: string;
  onAcao?: () => void;
}) {
  return (
    <View style={estilos.vazio}>
      <View style={estilos.vazioIcone}>
        <Icon name={icone} size={30} color={colors.mutedForeground} />
      </View>
      <Text style={estilos.vazioTitulo}>{titulo}</Text>
      {descricao ? <Text style={estilos.vazioDescricao}>{descricao}</Text> : null}
      {acao && onAcao ? (
        <Button label={acao} onPress={onAcao} variante="secundario" style={estilos.vazioBotao} />
      ) : null}
    </View>
  );
}

export function Loading({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <View style={estilos.carregando}>
      <ActivityIndicator color={colors.orange} size="large" />
      <Text style={estilos.carregandoTexto}>{texto}</Text>
    </View>
  );
}

export function ErrorState({ mensagem, onTentarNovamente }: { mensagem: string; onTentarNovamente?: () => void }) {
  return (
    <View style={estilos.vazio}>
      <View style={[estilos.vazioIcone, { backgroundColor: tints.destructive }]}>
        <Icon name="alert-circle" size={30} color={colors.destructive} />
      </View>
      <Text style={estilos.vazioTitulo}>Não foi possível carregar</Text>
      <Text style={estilos.vazioDescricao}>{mensagem}</Text>
      {onTentarNovamente ? (
        <Button
          label="Tentar novamente"
          onPress={onTentarNovamente}
          variante="contorno"
          style={estilos.vazioBotao}
        />
      ) : null}
    </View>
  );
}

/** Aviso informativo azul-claro reutilizado em vários formulários. */
export function InfoBox({ children, icone = 'shield' }: { children: React.ReactNode; icone?: NomeIcone }) {
  return (
    <View style={estilos.infoBox}>
      <Icon name={icone} size={18} color={colors.navyLight} />
      <Text style={estilos.infoTexto}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ Estilos */

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  tela: { flex: 1, backgroundColor: colors.background },
  conteudoScroll: { paddingBottom: spacing.xxl },
  pressionado: { opacity: 0.85 },
  desabilitado: { opacity: 0.5 },

  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerCompacto: { paddingBottom: spacing.lg },
  headerLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  headerBotao: { padding: 2 },
  headerTitulo: { ...typography.h3, color: colors.white },

  voltar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start' },
  voltarLabel: { ...typography.bodyMedium },

  secaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  secaoTitulo: { ...typography.title, color: colors.navy },
  secaoAcao: { ...typography.smallMedium, color: colors.orange },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardDestacado: { borderColor: colors.orange, borderWidth: 2 },

  barraInferior: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.md,
  },

  botao: {
    minHeight: 52,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  botaoTexto: { fontSize: 15, fontWeight: '700' },
  botaoContorno: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.navy },
  botaoPerigo: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.destructive },
  botaoFantasma: { backgroundColor: 'transparent', minHeight: 40 },

  campo: { marginBottom: spacing.lg },
  campoLabel: { ...typography.smallMedium, color: colors.navy, marginBottom: spacing.sm },
  campoCaixa: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.inputBackground,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  campoCaixaErro: { borderColor: colors.destructive },
  campoInput: { flex: 1, ...typography.body, color: colors.navy, paddingVertical: spacing.md },
  campoAjuda: { ...typography.caption, color: colors.mutedForeground, marginTop: spacing.xs, paddingHorizontal: 2 },
  campoErro: { ...typography.caption, color: colors.destructive, marginTop: spacing.xs, paddingHorizontal: 2 },
  marcadorOrigem: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange },

  textArea: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.inputBackground,
    padding: spacing.lg,
    ...typography.body,
    color: colors.navy,
  },

  checkboxLinha: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.sm },
  checkboxCaixa: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMarcado: { backgroundColor: colors.orange, borderColor: colors.orange },

  toggleLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  toggleTitulo: { ...typography.bodyMedium, color: colors.navy },
  toggleDescricao: { ...typography.caption, color: colors.mutedForeground, marginTop: 2, lineHeight: 16 },

  opcoesLinha: { flexDirection: 'row', gap: spacing.md },
  opcao: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoAtiva: { borderColor: colors.orange, backgroundColor: tints.orange },
  opcaoTexto: { ...typography.bodyMedium, color: colors.navy },
  opcaoTextoAtivo: { color: colors.orangeDark },

  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: colors.white, fontWeight: '700' },

  badge: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.pill },
  badgeTexto: { ...typography.caption, fontWeight: '700' },

  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.muted,
  },
  chipAtivo: { backgroundColor: colors.navy },
  chipTexto: { ...typography.smallMedium, color: colors.navy },
  chipTextoAtivo: { color: colors.white },

  bolha: { alignItems: 'center', justifyContent: 'center' },

  estrelasLinha: { flexDirection: 'row', gap: spacing.md },
  estrelasLinhaCompacta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  notaTexto: { ...typography.smallMedium, color: colors.navy },
  notaSufixo: { ...typography.caption, color: colors.mutedForeground, marginLeft: 2 },

  trajeto: { flexDirection: 'row', gap: spacing.md },
  trajetoColuna: { alignItems: 'center', paddingTop: 4, gap: spacing.xs },
  pontoOrigemVazado: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.orange },
  trajetoLinhaVertical: { width: 1, flex: 1, minHeight: 28, backgroundColor: colors.border },
  trajetoBloco: { flex: 1, marginBottom: spacing.lg },
  trajetoTitulo: { ...typography.bodyMedium, color: colors.navy },
  trajetoDetalhe: { ...typography.small, color: colors.mutedForeground, marginTop: 2 },

  trajetoCompacto: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  trajetoPonta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  trajetoPontaFim: { justifyContent: 'flex-end' },
  pontoOrigem: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange },
  trajetoTraco: { height: 1, width: 28, backgroundColor: colors.border },
  trajetoTextoCompacto: { ...typography.small, color: colors.mutedForeground, flexShrink: 1 },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValor: { ...typography.h3, color: colors.navy },
  statLabel: { ...typography.caption, color: colors.mutedForeground, textAlign: 'center', lineHeight: 15 },

  headerStat: { flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: tints.onNavy },
  headerStatLabel: { ...typography.caption, color: tints.onNavyText, marginBottom: 2 },
  headerStatValor: { fontSize: 16, fontWeight: '700', color: colors.white },

  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  menuItemBorda: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuTitulo: { ...typography.bodyMedium, color: colors.navy },
  menuDescricao: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },

  vazio: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: spacing.xl },
  vazioIcone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  vazioTitulo: { ...typography.title, color: colors.navy, marginBottom: spacing.xs, textAlign: 'center' },
  vazioDescricao: { ...typography.small, color: colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
  vazioBotao: { marginTop: spacing.xl, alignSelf: 'stretch' },

  carregando: { paddingVertical: 56, alignItems: 'center', gap: spacing.md },
  carregandoTexto: { ...typography.small, color: colors.mutedForeground },

  infoBox: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#EEF5FA',
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  infoTexto: { flex: 1, ...typography.caption, color: colors.navyLight, lineHeight: 17 },
});

export const ui = estilos;
export { shadow };
