import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackButton, Button, IconBubble } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';
import { authService } from '../lib/servicos';
import { useNavigation } from '../state/NavigationContext';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';

/** Código de 6 dígitos enviado no cadastro. */
export function EmailVerificationScreen() {
  const { atual, substituir, voltar, podeVoltar } = useNavigation();
  const email: string = atual.params?.email ?? '';

  const entrada = useRef<TextInput>(null);
  const [codigo, setCodigo] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; erro: boolean } | null>(null);

  const verificar = async () => {
    if (!/^\d{6}$/.test(codigo)) {
      setAviso({ texto: 'Digite os 6 dígitos que enviamos por e-mail.', erro: true });
      return;
    }

    setVerificando(true);
    setAviso(null);

    try {
      await authService.verificarEmail(email, codigo);
      substituir('login');
    } catch (falha) {
      setAviso({
        texto: falha instanceof Error ? falha.message : 'Código inválido ou expirado.',
        erro: true,
      });
    } finally {
      setVerificando(false);
    }
  };

  const reenviar = async () => {
    setReenviando(true);
    try {
      const resposta = await authService.reenviarCodigo(email);
      setAviso({ texto: resposta.message, erro: false });
    } catch (falha) {
      setAviso({
        texto: falha instanceof Error ? falha.message : 'Tente novamente em instantes.',
        erro: true,
      });
    } finally {
      setReenviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={estilos.scrollConteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.topo}>
            {podeVoltar ? <BackButton onPress={voltar} /> : null}
          </View>

          <View style={estilos.conteudo}>
            <IconBubble nome="mail" cor={colors.orange} tamanho={80} />

            <Text style={estilos.titulo}>Verifique seu e-mail</Text>

            <Text style={estilos.subtitulo}>
              Enviamos um código de 6 dígitos para{' '}
              <Text style={estilos.email}>{email}</Text>
            </Text>

            <Pressable
              style={estilos.otpLinha}
              onPress={() => entrada.current?.focus()}
            >
              {Array.from({ length: 6 }).map((_, indice) => (
                <View
                  key={indice}
                  style={[
                    estilos.otpCaixa,
                    codigo.length === indice && estilos.otpCaixaAtiva,
                  ]}
                >
                  <Text style={estilos.otpTexto}>
                    {codigo[indice] ?? ''}
                  </Text>
                </View>
              ))}
            </Pressable>

            <TextInput
              ref={entrada}
              value={codigo}
              onChangeText={(valor) =>
                setCodigo(valor.replace(/\D/g, '').slice(0, 6))
              }
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              style={estilos.otpEntrada}
            />

            {aviso ? (
              <Text
                style={[
                  estilos.aviso,
                  aviso.erro ? estilos.avisoErro : estilos.avisoOk,
                ]}
              >
                {aviso.texto}
              </Text>
            ) : null}

            <Button
              label="Verificar"
              onPress={() => {
                Keyboard.dismiss();
                verificar();
              }}
              carregando={verificando}
              style={estilos.botao}
            />

            <Pressable
              onPress={reenviar}
              disabled={reenviando}
              style={estilos.reenviar}
            >
              <Icon
                name="refresh"
                size={16}
                color={colors.orange}
              />

              <Text style={estilos.reenviarTexto}>
                {reenviando ? 'Enviando...' : 'Reenviar código'}
              </Text>
            </Pressable>

            <Text style={estilos.dica}>
              Não recebeu? Confira a caixa de spam.
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  scrollConteudo: {
    flexGrow: 1,
  },
  tela: { flex: 1, backgroundColor: colors.background },
  topo: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, minHeight: 60 },
  conteudo: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },

  titulo: { ...typography.h2, color: colors.navy, marginTop: spacing.xl, textAlign: 'center' },
  subtitulo: {
    ...typography.small,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    maxWidth: 320,
  },
  email: { color: colors.navy, fontWeight: '700' },

  otpLinha: { flexDirection: 'row', gap: spacing.sm },
  otpCaixa: {
    width: 46,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCaixaAtiva: { borderColor: colors.orange },
  otpTexto: { fontSize: 21, fontWeight: '700', color: colors.navy },
  otpEntrada: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  aviso: { ...typography.small, textAlign: 'center', marginTop: spacing.lg, maxWidth: 320 },
  avisoErro: { color: colors.destructive },
  avisoOk: { color: colors.success },

  botao: { alignSelf: 'stretch', marginTop: spacing.xl },
  reenviar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, padding: spacing.sm },
  reenviarTexto: { ...typography.smallMedium, color: colors.orange },
  dica: { ...typography.caption, color: colors.mutedForeground, marginTop: spacing.xl, textAlign: 'center' },
});
