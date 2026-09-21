import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  BottomBar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Header,
  InfoBox,
  Loading,
  Screen,
  SectionTitle,
  TextArea,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { primeiroNome } from '../lib/format';
import { avaliacaoService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Avaliar carona. Recebe `viagemId` por parâmetro, pergunta ao backend
 * quem ainda falta avaliar e envia POST /avaliacoes para cada pessoa.
 */

const CATEGORIAS = [
  { chave: 'pontualidade', label: 'Pontualidade', emoji: '⏰' },
  { chave: 'seguranca', label: 'Segurança', emoji: '🛡️' },
  { chave: 'limpeza', label: 'Limpeza', emoji: '✨' },
  { chave: 'comunicacao', label: 'Comunicação', emoji: '💬' },
];

const TAGS = [
  'Muito pontual',
  'Direção segura',
  'Veículo limpo',
  'Boa conversa',
  'Respeitoso(a)',
  'Trajeto rápido',
];

const LEGENDAS = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente!'];

export function RatingScreen() {
  const { atual, voltar, substituir } = useNavigation();
  const viagemId: string | undefined = atual.params?.viagemId;

  const pendentes = useCarregar(
    () => (viagemId ? avaliacaoService.pendentes(viagemId) : Promise.resolve(null)),
    [viagemId],
  );

  const [indice, setIndice] = useState(0);
  const [nota, setNota] = useState(5);
  const [categorias, setCategorias] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const lista = pendentes.dados?.pendentes ?? [];
  const alvo = lista[indice];

  // Ao trocar de pessoa, o formulário volta ao estado inicial.
  useEffect(() => {
    setNota(5);
    setCategorias({});
    setTags([]);
    setComentario('');
  }, [indice]);

  const alternarTag = (tag: string) =>
    setTags((atuais) => (atuais.includes(tag) ? atuais.filter((item) => item !== tag) : [...atuais, tag]));

  const enviar = async () => {
    if (!alvo || !viagemId) return;

    setEnviando(true);
    setErroEnvio(null);

    try {
      await avaliacaoService.criar({
        viagemId,
        alvoId: alvo.id,
        nota,
        comentario: comentario.trim() || undefined,
        categorias: Object.keys(categorias).length ? categorias : undefined,
        tags,
      });

      if (indice < lista.length - 1) {
        setIndice(indice + 1);
      } else {
        substituir('history');
      }
    } catch (falha) {
      setErroEnvio(falha instanceof Error ? falha.message : 'Não foi possível enviar a avaliação.');
    } finally {
      setEnviando(false);
    }
  };

  if (pendentes.carregando) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Avaliar carona" onVoltar={voltar} />
        <Loading />
      </View>
    );
  }

  if (pendentes.erro || !viagemId) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Avaliar carona" onVoltar={voltar} />
        <ErrorState
          mensagem={pendentes.erro ?? 'Viagem não informada.'}
          onTentarNovamente={viagemId ? pendentes.recarregar : undefined}
        />
      </View>
    );
  }

  if (!alvo) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Avaliar carona" onVoltar={voltar} />
        <EmptyState
          icone="check-circle"
          titulo="Nada para avaliar"
          descricao="Você já avaliou todo mundo desta viagem."
          acao="Voltar ao histórico"
          onAcao={() => substituir('history')}
        />
      </View>
    );
  }

  return (
    <View style={estilos.tela}>
      <Header titulo="Avaliar carona" onVoltar={voltar} />

      <Screen contentStyle={estilos.conteudo}>
        <View style={estilos.topo}>
          <Avatar nome={alvo.nome} tamanho={80} />
          <Text style={estilos.pergunta}>Como foi sua carona com {primeiroNome(alvo.nome)}?</Text>
          <Text style={estilos.trajeto}>{pendentes.dados?.trajeto}</Text>
          {lista.length > 1 ? (
            <Text style={estilos.progresso}>
              {indice + 1} de {lista.length} pessoas
            </Text>
          ) : null}
        </View>

        <View style={estilos.estrelas}>
          {[1, 2, 3, 4, 5].map((valor) => (
            <Pressable key={valor} onPress={() => setNota(valor)} hitSlop={4}>
              <Icon
                name={valor <= nota ? 'star' : 'star-outline'}
                size={44}
                color={valor <= nota ? colors.orange : colors.border}
              />
            </Pressable>
          ))}
        </View>
        <Text style={estilos.legenda}>{LEGENDAS[nota]}</Text>

        <View style={estilos.bloco}>
          <SectionTitle>Avalie por categoria</SectionTitle>
          {CATEGORIAS.map((categoria) => (
            <Card key={categoria.chave} style={estilos.cartaoCategoria}>
              <View style={estilos.linhaCategoria}>
                <Text style={estilos.emoji}>{categoria.emoji}</Text>
                <Text style={estilos.categoriaLabel}>{categoria.label}</Text>
              </View>
              <View style={estilos.notasLinha}>
                {[1, 2, 3, 4, 5].map((valor) => {
                  const ativo = categorias[categoria.chave] === valor;
                  return (
                    <Pressable
                      key={valor}
                      onPress={() =>
                        setCategorias((atuais) => ({ ...atuais, [categoria.chave]: valor }))
                      }
                      style={[estilos.notaBotao, ativo && estilos.notaBotaoAtivo]}
                    >
                      <Text style={[estilos.notaTexto, ativo && estilos.notaTextoAtivo]}>{valor}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          ))}
        </View>

        <View style={estilos.bloco}>
          <SectionTitle>Comentários rápidos</SectionTitle>
          <View style={estilos.tags}>
            {TAGS.map((tag) => {
              const ativo = tags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => alternarTag(tag)}
                  style={[estilos.tag, ativo && estilos.tagAtiva]}
                >
                  <Icon name="check" size={13} color={ativo ? colors.orange : colors.mutedForeground} />
                  <Text style={[estilos.tagTexto, ativo && estilos.tagTextoAtivo]}>{tag}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <TextArea
          label="Comentário (opcional)"
          placeholder="Compartilhe mais detalhes sobre sua experiência..."
          value={comentario}
          onChangeText={setComentario}
        />

        <InfoBox icone="help-circle">
          Avaliações honestas ajudam a manter a comunidade segura e confiável.
        </InfoBox>

        {erroEnvio ? <Text style={estilos.erro}>{erroEnvio}</Text> : null}
      </Screen>

      <BottomBar>
        <Button
          label={indice < lista.length - 1 ? 'Enviar e avaliar próximo' : 'Enviar avaliação'}
          variante="secundario"
          icone="send"
          carregando={enviando}
          onPress={enviar}
        />
      </BottomBar>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },

  topo: { alignItems: 'center', gap: spacing.sm },
  pergunta: { ...typography.h3, color: colors.navy, textAlign: 'center', marginTop: spacing.md },
  trajeto: { ...typography.small, color: colors.mutedForeground },
  progresso: { ...typography.caption, color: colors.orange, fontWeight: '600' },

  estrelas: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  legenda: { ...typography.bodyMedium, color: colors.orange, textAlign: 'center', marginTop: -spacing.md },

  bloco: { gap: spacing.md },
  cartaoCategoria: { gap: spacing.md },
  linhaCategoria: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emoji: { fontSize: 18 },
  categoriaLabel: { ...typography.smallMedium, color: colors.navy },
  notasLinha: { flexDirection: 'row', gap: spacing.sm },
  notaBotao: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notaBotaoAtivo: { borderColor: colors.orange, backgroundColor: tints.orange },
  notaTexto: { ...typography.smallMedium, color: colors.navy },
  notaTextoAtivo: { color: colors.orange },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tagAtiva: { borderColor: colors.orange, backgroundColor: tints.orange },
  tagTexto: { ...typography.small, color: colors.navy },
  tagTextoAtivo: { color: colors.orange, fontWeight: '600' },

  erro: { ...typography.small, color: colors.destructive },
});
