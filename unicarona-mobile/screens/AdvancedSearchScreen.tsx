import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomBar, Button, Field, Header, Screen, SectionTitle, ToggleRow } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { mascaras } from '../lib/format';
import type { FiltrosBusca } from '../lib/servicos';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Busca avançada. Não chama a API: monta o objeto de filtros e devolve
 * para a tela de busca, que é quem consulta GET /caronas.
 */

const PERIODOS: { label: string; inicio: string; fim: string }[] = [
  { label: 'Manhã', inicio: '05:00', fim: '12:00' },
  { label: 'Tarde', inicio: '12:00', fim: '18:00' },
  { label: 'Noite', inicio: '18:00', fim: '23:59' },
];

const FAIXAS_PRECO = [
  { label: 'Até R$ 10', min: undefined, max: 10 },
  { label: 'R$ 10 a 20', min: 10, max: 20 },
  { label: 'R$ 20 a 35', min: 20, max: 35 },
  { label: 'Acima de R$ 35', min: 35, max: undefined },
];

const NOTAS = [3, 4, 4.5, 5];

const PREFERENCIAS: { valor: string; label: string; icone: 'clock' | 'users' | 'car' | 'leaf' }[] = [
  { valor: 'saida-imediata', label: 'Saída imediata', icone: 'clock' },
  { valor: 'musica', label: 'Música OK', icone: 'users' },
  { valor: 'bagagem', label: 'Aceita bagagem', icone: 'car' },
  { valor: 'paradas', label: 'Paradas OK', icone: 'leaf' },
];

export function AdvancedSearchScreen() {
  const { atual, voltar, substituir } = useNavigation();
  const iniciais: FiltrosBusca = atual.params?.filtros ?? {};

  const [origem, setOrigem] = useState(iniciais.origem ?? '');
  const [destino, setDestino] = useState(iniciais.destino ?? '');
  const [data, setData] = useState(paraBr(iniciais.data));
  const [periodo, setPeriodo] = useState<string | null>(null);
  const [faixa, setFaixa] = useState<number | null>(null);
  const [vagas, setVagas] = useState<number | null>(iniciais.vagasMinimas ?? null);
  const [nota, setNota] = useState<number | null>(iniciais.notaMinima ?? null);
  const [preferencias, setPreferencias] = useState<string[]>(iniciais.preferencias ?? []);
  const [apenasVerificados, setApenasVerificados] = useState(!!iniciais.apenasVerificados);

  const alternarPreferencia = (valor: string) =>
    setPreferencias((atuais) =>
      atuais.includes(valor) ? atuais.filter((item) => item !== valor) : [...atuais, valor],
    );

  const limpar = () => {
    setOrigem('');
    setDestino('');
    setData('');
    setPeriodo(null);
    setFaixa(null);
    setVagas(null);
    setNota(null);
    setPreferencias([]);
    setApenasVerificados(false);
  };

  const aplicar = () => {
    const janela = PERIODOS.find((item) => item.label === periodo);
    const preco = faixa !== null ? FAIXAS_PRECO[faixa] : null;

    const filtros: FiltrosBusca = {
      origem: origem.trim() || undefined,
      destino: destino.trim() || undefined,
      data: paraIsoCurta(data),
      horaInicio: janela?.inicio,
      horaFim: janela?.fim,
      precoMin: preco?.min,
      precoMax: preco?.max,
      vagasMinimas: vagas ?? undefined,
      notaMinima: nota ?? undefined,
      preferencias: preferencias.length ? preferencias : undefined,
      apenasVerificados: apenasVerificados || undefined,
    };

    // Troca esta tela pela busca já filtrada, em vez de empilhar mais uma.
    substituir('find-ride', { filtros });
  };

  return (
    <View style={estilos.tela}>
      <Header titulo="Filtros avançados" onVoltar={voltar} />

      <Screen contentStyle={estilos.conteudo}>
        <View style={estilos.bloco}>
          <SectionTitle>Trajeto</SectionTitle>
          <Field marcador placeholder="Origem" value={origem} onChangeText={setOrigem} />
          <Field icone="map-pin" placeholder="Destino" value={destino} onChangeText={setDestino} />
        </View>

        <View style={estilos.bloco}>
          <SectionTitle>Data e horário</SectionTitle>
          <Field
            icone="calendar"
            placeholder="dd/mm/aaaa"
            keyboardType="numeric"
            value={data}
            onChangeText={(valor) => setData(mascaras.data(valor))}
          />
          <View style={estilos.linha}>
            {PERIODOS.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => setPeriodo(periodo === item.label ? null : item.label)}
                style={[estilos.pilula, periodo === item.label && estilos.pilulaAtiva]}
              >
                <Text style={[estilos.pilulaTexto, periodo === item.label && estilos.pilulaTextoAtivo]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={estilos.bloco}>
          <SectionTitle>Faixa de preço</SectionTitle>
          <View style={estilos.grade}>
            {FAIXAS_PRECO.map((item, indice) => (
              <Pressable
                key={item.label}
                onPress={() => setFaixa(faixa === indice ? null : indice)}
                style={[estilos.cartaoOpcao, faixa === indice && estilos.cartaoOpcaoAtivo]}
              >
                <Icon
                  name="dollar-sign"
                  size={16}
                  color={faixa === indice ? colors.orange : colors.mutedForeground}
                />
                <Text style={[estilos.opcaoTexto, faixa === indice && estilos.opcaoTextoAtivo]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={estilos.bloco}>
          <SectionTitle>Vagas necessárias</SectionTitle>
          <View style={estilos.linha}>
            {[1, 2, 3, 4].map((numero) => (
              <Pressable
                key={numero}
                onPress={() => setVagas(vagas === numero ? null : numero)}
                style={[estilos.pilula, vagas === numero && estilos.pilulaAtiva]}
              >
                <Text style={[estilos.pilulaTexto, vagas === numero && estilos.pilulaTextoAtivo]}>
                  {numero}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={estilos.bloco}>
          <SectionTitle>Avaliação mínima</SectionTitle>
          <View style={estilos.linha}>
            {NOTAS.map((valor) => (
              <Pressable
                key={valor}
                onPress={() => setNota(nota === valor ? null : valor)}
                style={[estilos.pilula, estilos.pilulaNota, nota === valor && estilos.pilulaAtiva]}
              >
                <Icon name="star" size={14} color={nota === valor ? colors.orange : colors.border} />
                <Text style={[estilos.pilulaTexto, nota === valor && estilos.pilulaTextoAtivo]}>
                  {valor}+
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={estilos.bloco}>
          <SectionTitle>Preferências</SectionTitle>
          <View style={estilos.grade}>
            {PREFERENCIAS.map((item) => {
              const ativo = preferencias.includes(item.valor);
              return (
                <Pressable
                  key={item.valor}
                  onPress={() => alternarPreferencia(item.valor)}
                  style={[estilos.cartaoOpcao, ativo && estilos.cartaoOpcaoAtivo]}
                >
                  <Icon
                    name={item.icone}
                    size={16}
                    color={ativo ? colors.orange : colors.mutedForeground}
                  />
                  <Text style={[estilos.opcaoTexto, ativo && estilos.opcaoTextoAtivo]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={estilos.cartaoToggle}>
          <ToggleRow
            titulo="Apenas verificados"
            descricao="Motoristas com identidade aprovada"
            valor={apenasVerificados}
            onChange={setApenasVerificados}
          />
        </View>
      </Screen>

      <BottomBar>
        <View style={estilos.acoes}>
          <Button label="Limpar" variante="contorno" onPress={limpar} style={estilos.flex} />
          <Button label="Aplicar filtros" variante="secundario" onPress={aplicar} style={estilos.flex} />
        </View>
      </BottomBar>
    </View>
  );
}

/** "2026-05-01" (filtro guardado) → "01/05/2026" (exibição). */
function paraBr(valor?: string): string {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return '';
  const [ano, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${ano}`;
}

function paraIsoCurta(valor: string): string | undefined {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return undefined;
  const [dia, mes, ano] = valor.split('/');
  return `${ano}-${mes}-${dia}`;
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  bloco: { gap: spacing.md },

  linha: { flexDirection: 'row', gap: spacing.md },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },

  pilula: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilulaNota: { flexDirection: 'row', gap: spacing.xs },
  pilulaAtiva: { borderColor: colors.orange, backgroundColor: tints.orange },
  pilulaTexto: { ...typography.smallMedium, color: colors.navy },
  pilulaTextoAtivo: { color: colors.orange },

  cartaoOpcao: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cartaoOpcaoAtivo: { borderColor: colors.orange, backgroundColor: tints.orange },
  opcaoTexto: { ...typography.smallMedium, color: colors.navy, flexShrink: 1 },
  opcaoTextoAtivo: { color: colors.orange },

  cartaoToggle: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  acoes: { flexDirection: 'row', gap: spacing.md },
});
