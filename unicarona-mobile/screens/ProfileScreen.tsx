import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  ErrorState,
  Field,
  Header,
  Loading,
  Screen,
  SectionTitle,
  StatCard,
  StarRating,
  TextArea,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { formatarData, mascaras } from '../lib/format';
import { usuarioService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useAuth } from '../state/AuthContext';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Perfil. Mostra GET /usuarios/me e, no modo edição, envia PATCH
 * /usuarios/me. As avaliações vêm de GET /usuarios/:id/avaliacoes.
 */

const PREFERENCIAS_DISPONIVEIS = [
  'Música ambiente',
  'Pontual',
  'Não fuma',
  'Aceita pets',
  'Aceita bagagem',
  'Conversa tranquila',
];

export function ProfileScreen() {
  const { voltar, navegar } = useNavigation();
  const { atualizarUsuario } = useAuth();

  const perfil = useCarregar(() => usuarioService.meuPerfil(), []);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [curso, setCurso] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bio, setBio] = useState('');
  const [preferencias, setPreferencias] = useState<string[]>([]);

  const avaliacoes = useCarregar(
    () => (perfil.dados ? usuarioService.avaliacoes(perfil.dados.id) : Promise.resolve([])),
    [perfil.dados?.id],
  );

  const abrirEdicao = () => {
    const dados = perfil.dados;
    if (!dados) return;

    setNome(dados.nome ?? '');
    setCurso(dados.curso ?? '');
    setTelefone(dados.telefone ?? '');
    setBio(dados.bio ?? '');
    setPreferencias(dados.preferencias ?? []);
    setErroSalvar(null);
    setEditando(true);
  };

  const alternarPreferencia = (item: string) =>
    setPreferencias((atuais) =>
      atuais.includes(item) ? atuais.filter((valor) => valor !== item) : [...atuais, item],
    );

  const salvar = async () => {
    setSalvando(true);
    setErroSalvar(null);

    try {
      const atualizado = await usuarioService.atualizar({
        nome: nome.trim(),
        curso: curso.trim() || null,
        telefone: telefone.trim() || null,
        bio: bio.trim() || null,
        preferencias,
      });

      atualizarUsuario(atualizado);
      if (perfil.dados) perfil.definir({ ...perfil.dados, ...atualizado });
      setEditando(false);
    } catch (falha) {
      setErroSalvar(falha instanceof Error ? falha.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  if (perfil.carregando) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Perfil" onVoltar={voltar} />
        <Loading />
      </View>
    );
  }

  if (perfil.erro || !perfil.dados) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Perfil" onVoltar={voltar} />
        <ErrorState mensagem={perfil.erro ?? 'Perfil indisponível.'} onTentarNovamente={perfil.recarregar} />
      </View>
    );
  }

  const dados = perfil.dados;

  if (editando) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Editar perfil" onVoltar={() => setEditando(false)} />

        <Screen contentStyle={estilos.conteudo}>
          <Field label="Nome completo" value={nome} onChangeText={setNome} icone="users" />
          <Field label="Curso" value={curso} onChangeText={setCurso} icone="award" />
          <Field
            label="Telefone"
            value={telefone}
            onChangeText={(valor) => setTelefone(mascaras.telefone(valor))}
            icone="phone"
            keyboardType="phone-pad"
          />
          <TextArea
            label="Sobre você"
            placeholder="Conte um pouco sobre seus trajetos e preferências..."
            value={bio}
            onChangeText={setBio}
          />

          <View style={estilos.bloco}>
            <SectionTitle>Preferências de viagem</SectionTitle>
            <View style={estilos.tags}>
              {PREFERENCIAS_DISPONIVEIS.map((item) => {
                const ativo = preferencias.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => alternarPreferencia(item)}
                    style={[estilos.tag, ativo && estilos.tagAtiva]}
                  >
                    <Text style={[estilos.tagTexto, ativo && estilos.tagTextoAtivo]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {erroSalvar ? <Text style={estilos.erro}>{erroSalvar}</Text> : null}

          <Button label="Salvar alterações" carregando={salvando} onPress={salvar} />
        </Screen>
      </View>
    );
  }

  return (
    <View style={estilos.tela}>
      <Header
        onVoltar={voltar}
        acao={
          <Pressable onPress={abrirEdicao} hitSlop={10}>
            <Icon name="edit" size={20} color={colors.white} />
          </Pressable>
        }
      >
        <View style={estilos.cabecalho}>
          <Avatar nome={dados.nome} tamanho={96} />
          <Text style={estilos.nomeGrande}>{dados.nome}</Text>

          <Text style={estilos.subtitulo}>
            {[dados.curso, dados.universidade].filter(Boolean).join(' • ') || 'Estudante'}
          </Text>

          <View style={estilos.linhaNota}>
            <StarRating nota={dados.avaliacaoMedia} tamanho={16} />
            <Text style={estilos.totalAvaliacoes}>
              ({dados.totalAvaliacoes} avaliações)
            </Text>
          </View>

          <View style={estilos.selo}>
            <Icon name="check-circle" size={13} color={colors.success} />
            <Text style={estilos.seloTexto}>
              E-mail institucional verificado
            </Text>
          </View>
        </View>
      </Header>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.estatisticas}>
          <StatCard
            icone="map-pin"
            valor={dados.estatisticas.caronasOferecidas}
            label="Oferecidas"
          />
          <StatCard
            icone="calendar"
            valor={dados.estatisticas.caronasRecebidas}
            label="Recebidas"
          />
          <StatCard
            icone="leaf"
            valor={`${dados.estatisticas.co2EvitadoKg.toFixed(0)} kg`}
            label="CO₂ evitado"
            cor={colors.success}
          />
        </View>

        <Card style={estilos.bloco}>
          <SectionTitle>Sobre</SectionTitle>
          <Text style={estilos.bio}>
            {dados.bio?.trim() || 'Este perfil ainda não tem uma descrição.'}
          </Text>
          {dados.preferencias?.length ? (
            <View style={estilos.tags}>
              {dados.preferencias.map((item) => (
                <View key={item} style={estilos.tagLeitura}>
                  <Text style={estilos.tagTexto}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        <View style={estilos.bloco}>
          <SectionTitle>Avaliações recebidas</SectionTitle>

          {avaliacoes.carregando ? (
            <Loading texto="Carregando avaliações..." />
          ) : (avaliacoes.dados?.length ?? 0) === 0 ? (
            <Text style={estilos.vazio}>Ninguém avaliou você ainda.</Text>
          ) : (
            avaliacoes.dados!.slice(0, 5).map((avaliacao) => (
              <Card key={avaliacao.id} style={estilos.cartaoAvaliacao}>
                <View style={estilos.linhaAvaliacao}>
                  <Avatar nome={avaliacao.autor.nome} tamanho={40} cor={colors.navy} />
                  <View style={estilos.flex}>
                    <Text style={estilos.autorNome}>{avaliacao.autor.nome}</Text>
                    <StarRating nota={avaliacao.nota} tamanho={12} />
                  </View>
                  <Text style={estilos.dataAvaliacao}>{formatarData(avaliacao.criadaEm)}</Text>
                </View>
                {avaliacao.comentario ? (
                  <Text style={estilos.comentario}>{avaliacao.comentario}</Text>
                ) : null}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  cabecalho: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  nomeGrande: { ...typography.h2, color: colors.white, marginTop: spacing.md },
  subtitulo: { ...typography.small, color: tints.onNavyText },
  linhaNota: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  totalAvaliacoes: { ...typography.small, color: tints.onNavyText },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: tints.onNavy,
  },
  seloTexto: { ...typography.caption, fontWeight: '600', color: colors.success },

  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  estatisticas: { flexDirection: 'row', gap: spacing.md },

  bloco: { gap: spacing.md },
  bio: { ...typography.small, color: colors.mutedForeground },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tagLeitura: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.muted,
  },
  tagAtiva: { borderColor: colors.orange, backgroundColor: tints.orange },
  tagTexto: { ...typography.caption, fontWeight: '600', color: colors.navy },
  tagTextoAtivo: { color: colors.orange },

  cartaoAvaliacao: { gap: spacing.sm },
  linhaAvaliacao: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  autorNome: { ...typography.smallMedium, color: colors.navy },
  dataAvaliacao: { ...typography.caption, color: colors.mutedForeground },
  comentario: { ...typography.small, color: colors.mutedForeground },

  vazio: { ...typography.small, color: colors.mutedForeground },
  erro: { ...typography.small, color: colors.destructive },
});
