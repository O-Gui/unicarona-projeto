import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  EmptyState,
  Field,
  Header,
  InfoBox,
  Screen,
  SectionTitle,
} from '../components/ui';
import { Icon, NomeIcone } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Métodos de pagamento. O backend ainda não processa pagamentos, então
 * esta tela mantém os métodos apenas em memória. Quando existir um endpoint,
 * basta trocar `useState` por um serviço em `lib/servicos.ts`.
 */

type TipoMetodo = 'cartao' | 'pix' | 'dinheiro';

interface Metodo {
  id: string;
  tipo: TipoMetodo;
  titulo: string;
  detalhe?: string;
  padrao: boolean;
}

const ICONES: Record<TipoMetodo, NomeIcone> = {
  cartao: 'credit-card',
  pix: 'phone',
  dinheiro: 'dollar-sign',
};

const ROTULOS: Record<TipoMetodo, string> = {
  cartao: 'Cartão',
  pix: 'PIX',
  dinheiro: 'Dinheiro',
};

export function PaymentMethodsScreen() {
  const { voltar } = useNavigation();

  const [metodos, setMetodos] = useState<Metodo[]>([
    { id: 'dinheiro', tipo: 'dinheiro', titulo: 'Dinheiro', detalhe: 'Acerto direto com o motorista', padrao: true },
  ]);

  const [adicionando, setAdicionando] = useState(false);
  const [tipo, setTipo] = useState<TipoMetodo>('pix');
  const [identificacao, setIdentificacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const definirPadrao = (id: string) =>
    setMetodos((atuais) => atuais.map((metodo) => ({ ...metodo, padrao: metodo.id === id })));

  const remover = (id: string) =>
    setMetodos((atuais) => {
      const restantes = atuais.filter((metodo) => metodo.id !== id);
      if (restantes.length && !restantes.some((metodo) => metodo.padrao)) {
        restantes[0] = { ...restantes[0], padrao: true };
      }
      return restantes;
    });

  const adicionar = () => {
    const valor = identificacao.trim();
    if (!valor) {
      setErro(tipo === 'pix' ? 'Informe a chave PIX.' : 'Informe os 4 últimos dígitos do cartão.');
      return;
    }

    setMetodos((atuais) => [
      ...atuais,
      {
        id: `${tipo}-${Date.now()}`,
        tipo,
        titulo: tipo === 'pix' ? 'PIX' : `Cartão final ${valor.slice(-4)}`,
        detalhe: tipo === 'pix' ? valor : undefined,
        padrao: atuais.length === 0,
      },
    ]);

    setIdentificacao('');
    setErro(null);
    setAdicionando(false);
  };

  return (
    <View style={estilos.tela}>
      <Header titulo="Métodos de pagamento" onVoltar={voltar} />

      <Screen contentStyle={estilos.conteudo}>
        <SectionTitle
          acao={adicionando ? 'Cancelar' : 'Adicionar'}
          onAcao={() => {
            setAdicionando(!adicionando);
            setErro(null);
          }}
        >
          Suas formas de pagamento
        </SectionTitle>

        {metodos.length === 0 ? (
          <EmptyState
            icone="credit-card"
            titulo="Nenhum método cadastrado"
            descricao="Adicione uma forma de pagamento para agilizar o acerto das caronas."
          />
        ) : (
          metodos.map((metodo) => (
            <Card key={metodo.id} style={[estilos.cartao, metodo.padrao && estilos.cartaoPadrao]}>
              <View style={estilos.linhaCartao}>
                <View style={estilos.bolha}>
                  <Icon name={ICONES[metodo.tipo]} size={20} color={colors.navy} />
                </View>

                <View style={estilos.flex}>
                  <Text style={estilos.tituloMetodo}>{metodo.titulo}</Text>
                  {metodo.detalhe ? <Text style={estilos.detalhe}>{metodo.detalhe}</Text> : null}
                  {metodo.padrao ? (
                    <View style={estilos.selo}>
                      <Icon name="check" size={12} color={colors.orange} />
                      <Text style={estilos.seloTexto}>Padrão</Text>
                    </View>
                  ) : null}
                </View>

                <Pressable onPress={() => remover(metodo.id)} hitSlop={10}>
                  <Icon name="trash" size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>

              {!metodo.padrao ? (
                <Button
                  label="Definir como padrão"
                  variante="contorno"
                  onPress={() => definirPadrao(metodo.id)}
                  style={estilos.botaoPadrao}
                />
              ) : null}
            </Card>
          ))
        )}

        {adicionando ? (
          <Card style={estilos.formulario}>
            <SectionTitle>Novo método</SectionTitle>

            <View style={estilos.tipos}>
              {(['pix', 'cartao', 'dinheiro'] as TipoMetodo[]).map((opcao) => (
                <Pressable
                  key={opcao}
                  onPress={() => setTipo(opcao)}
                  style={[estilos.tipo, tipo === opcao && estilos.tipoAtivo]}
                >
                  <Icon
                    name={ICONES[opcao]}
                    size={16}
                    color={tipo === opcao ? colors.orange : colors.mutedForeground}
                  />
                  <Text style={[estilos.tipoTexto, tipo === opcao && estilos.tipoTextoAtivo]}>
                    {ROTULOS[opcao]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {tipo !== 'dinheiro' ? (
              <Field
                label={tipo === 'pix' ? 'Chave PIX' : 'Últimos 4 dígitos'}
                placeholder={tipo === 'pix' ? 'e-mail, telefone ou CPF' : '4532'}
                value={identificacao}
                onChangeText={setIdentificacao}
                keyboardType={tipo === 'cartao' ? 'numeric' : 'default'}
                erro={erro ?? undefined}
              />
            ) : (
              <Text style={estilos.detalhe}>
                Pagamento em dinheiro, acertado diretamente com o motorista.
              </Text>
            )}

            <Button
              label="Salvar método"
              onPress={
                tipo === 'dinheiro'
                  ? () => {
                      setMetodos((atuais) =>
                        atuais.some((metodo) => metodo.tipo === 'dinheiro')
                          ? atuais
                          : [
                              ...atuais,
                              {
                                id: `dinheiro-${Date.now()}`,
                                tipo: 'dinheiro',
                                titulo: 'Dinheiro',
                                detalhe: 'Acerto direto com o motorista',
                                padrao: atuais.length === 0,
                              },
                            ],
                      );
                      setAdicionando(false);
                    }
                  : adicionar
              }
            />
          </Card>
        ) : null}

        <InfoBox icone="shield">
          Os pagamentos ainda são combinados entre as pessoas da carona. Esta lista fica só no
          aparelho e serve para você lembrar como prefere pagar ou receber.
        </InfoBox>
      </Screen>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  conteudo: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl },

  cartao: { gap: spacing.md },
  cartaoPadrao: { borderColor: colors.orange },
  linhaCartao: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bolha: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloMetodo: { ...typography.smallMedium, color: colors.navy },
  detalhe: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },
  selo: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  seloTexto: { ...typography.caption, fontWeight: '600', color: colors.orange },
  botaoPadrao: { minHeight: 40 },

  formulario: { gap: spacing.md },
  tipos: { flexDirection: 'row', gap: spacing.sm },
  tipo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tipoAtivo: { borderColor: colors.orange, backgroundColor: tints.orange },
  tipoTexto: { ...typography.caption, fontWeight: '600', color: colors.navy },
  tipoTextoAtivo: { color: colors.orange },
});
