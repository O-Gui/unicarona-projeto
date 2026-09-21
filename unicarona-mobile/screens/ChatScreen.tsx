import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Avatar, EmptyState, ErrorState, Header, Loading } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { formatarHora, tempoRelativo } from '../lib/format';
import { chatService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';
import type { Mensagem } from '../lib/tipos';

/**
 * UC — Mensagens. Uma tela só com dois modos, como no protótipo: lista de
 * conversas e conversa aberta. Aceita `conversaId` (vindo das notificações)
 * ou `destinatarioId` + `caronaId` (vindo dos detalhes da carona).
 */
export function ChatScreen() {
  const { atual, voltar, navegar } = useNavigation();
  const [conversaId, setConversaId] = useState<string | null>(atual.params?.conversaId ?? null);
  const [abrindo, setAbrindo] = useState(false);

  // Quando a tela recebe um destinatário, garante a conversa antes de abrir.
  useEffect(() => {
    const destinatarioId: string | undefined = atual.params?.destinatarioId;
    if (!destinatarioId || conversaId) return;

    setAbrindo(true);
    chatService
      .abrir(destinatarioId, atual.params?.caronaId)
      .then((resposta) => setConversaId(resposta.conversaId))
      .catch(() => undefined)
      .finally(() => setAbrindo(false));
  }, [atual.params, conversaId]);

  if (abrindo) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Mensagens" onVoltar={voltar} />
        <Loading texto="Abrindo conversa..." />
      </View>
    );
  }

  if (conversaId) {
    return <Conversa conversaId={conversaId} onVoltar={() => setConversaId(null)} />;
  }

  return <ListaConversas onAbrir={setConversaId} onVoltar={voltar} onBuscar={() => navegar('find-ride')} />;
}

/* ---------------------------------------------------------- Lista */

function ListaConversas({
  onAbrir,
  onVoltar,
  onBuscar,
}: {
  onAbrir: (id: string) => void;
  onVoltar: () => void;
  onBuscar: () => void;
}) {
  const conversas = useCarregar(() => chatService.conversas(), []);

  return (
    <View style={estilos.tela}>
      <Header titulo="Mensagens" onVoltar={onVoltar} />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {conversas.carregando ? (
          <Loading />
        ) : conversas.erro ? (
          <ErrorState mensagem={conversas.erro} onTentarNovamente={conversas.recarregar} />
        ) : (conversas.dados?.length ?? 0) === 0 ? (
          <EmptyState
            icone="message-circle"
            titulo="Nenhuma conversa ainda"
            descricao="As conversas aparecem aqui quando você reserva ou oferece uma carona."
            acao="Buscar carona"
            onAcao={onBuscar}
          />
        ) : (
          conversas.dados!.map((conversa) => (
            <Pressable
              key={conversa.id}
              onPress={() => onAbrir(conversa.id)}
              style={({ pressed }) => [estilos.itemConversa, pressed && estilos.pressionado]}
            >
              <View>
                <Avatar nome={conversa.contato.nome} />
                {conversa.naoLidas > 0 ? (
                  <View style={estilos.badgeNaoLidas}>
                    <Text style={estilos.badgeTexto}>
                      {conversa.naoLidas > 9 ? '9+' : conversa.naoLidas}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={estilos.flex}>
                <View style={estilos.linhaTopo}>
                  <Text style={estilos.nomeContato} numberOfLines={1}>
                    {conversa.contato.nome}
                  </Text>
                  <Text style={estilos.horaConversa}>
                    {conversa.ultimaMensagem ? tempoRelativo(conversa.ultimaMensagem.enviadaEm) : ''}
                  </Text>
                </View>
                <Text style={estilos.previa} numberOfLines={1}>
                  {conversa.ultimaMensagem?.texto ?? 'Conversa iniciada'}
                </Text>
                {conversa.carona ? (
                  <Text style={estilos.trajetoConversa} numberOfLines={1}>
                    {conversa.carona.trajeto}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------- Conversa */

function Conversa({ conversaId, onVoltar }: { conversaId: string; onVoltar: () => void }) {
  const conversa = useCarregar(() => chatService.mensagens(conversaId), [conversaId]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const rolagem = useRef<ScrollView>(null);

  const enviar = async () => {
    const conteudo = texto.trim();
    if (!conteudo || enviando) return;

    setEnviando(true);
    setTexto('');

    try {
      const mensagem = await chatService.enviar({ conversaId, texto: conteudo });
      const atuais = conversa.dados;
      if (atuais) {
        conversa.definir({ ...atuais, mensagens: [...atuais.mensagens, mensagem as Mensagem] });
      }
    } catch {
      setTexto(conteudo);
    } finally {
      setEnviando(false);
    }
  };

  const contato = conversa.dados?.contato;

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      <Header compacto onVoltar={onVoltar}>
        <View style={estilos.cabecalhoContato}>
          <Avatar nome={contato?.nome} tamanho={40} />
          <View style={estilos.flex}>
            <Text style={estilos.contatoNome} numberOfLines={1}>
              {contato?.nome ?? 'Conversa'}
            </Text>
            {contato?.curso ? <Text style={estilos.contatoCurso}>{contato.curso}</Text> : null}
          </View>
        </View>
      </Header>

      {conversa.carregando ? (
        <Loading />
      ) : conversa.erro ? (
        <ErrorState mensagem={conversa.erro} onTentarNovamente={conversa.recarregar} />
      ) : (
        <ScrollView
          ref={rolagem}
          style={estilos.painelMensagens}
          contentContainerStyle={estilos.listaMensagens}
          onContentSizeChange={() => rolagem.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {conversa.dados!.mensagens.map((mensagem) => (
            <View
              key={mensagem.id}
              style={[estilos.balaoLinha, mensagem.minha && estilos.balaoLinhaMinha]}
            >
              <View style={[estilos.balao, mensagem.minha ? estilos.balaoMeu : estilos.balaoDele]}>
                <Text style={[estilos.balaoTexto, mensagem.minha && estilos.balaoTextoMeu]}>
                  {mensagem.texto}
                </Text>
                <Text style={[estilos.balaoHora, mensagem.minha && estilos.balaoHoraMinha]}>
                  {formatarHora(mensagem.enviadaEm)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={estilos.barraEnvio}>
        <TextInput
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#A9B6C2"
          value={texto}
          onChangeText={setTexto}
          style={estilos.entrada}
          multiline
        />
        <Pressable
          onPress={enviar}
          disabled={!texto.trim() || enviando}
          style={[estilos.botaoEnviar, (!texto.trim() || enviando) && estilos.desabilitado]}
        >
          <Icon name="send" size={20} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  pressionado: { opacity: 0.85 },
  desabilitado: { opacity: 0.5 },

  conteudo: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl },
  itemConversa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  badgeNaoLidas: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: { fontSize: 11, fontWeight: '700', color: colors.white },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nomeContato: { ...typography.bodyMedium, color: colors.navy, flex: 1 },
  horaConversa: { ...typography.caption, color: colors.mutedForeground },
  previa: { ...typography.small, color: colors.mutedForeground, marginTop: 2 },
  trajetoConversa: { ...typography.caption, color: colors.orange, marginTop: 2 },

  cabecalhoContato: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  contatoNome: { ...typography.bodyMedium, color: colors.white },
  contatoCurso: { ...typography.caption, color: tints.onNavyText },

  painelMensagens: { flex: 1, backgroundColor: colors.muted },
  listaMensagens: { padding: spacing.xl, gap: spacing.md },
  balaoLinha: { flexDirection: 'row', justifyContent: 'flex-start' },
  balaoLinhaMinha: { justifyContent: 'flex-end' },
  balao: { maxWidth: '78%', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.lg },
  balaoDele: { backgroundColor: colors.white, borderBottomLeftRadius: radius.sm },
  balaoMeu: { backgroundColor: colors.navy, borderBottomRightRadius: radius.sm },
  balaoTexto: { ...typography.small, color: colors.navy },
  balaoTextoMeu: { color: colors.white },
  balaoHora: { ...typography.caption, color: colors.mutedForeground, marginTop: spacing.xs },
  balaoHoraMinha: { color: tints.onNavyText },

  barraEnvio: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  entrada: {
    flex: 1,
    maxHeight: 110,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    ...typography.body,
    color: colors.navy,
  },
  botaoEnviar: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
