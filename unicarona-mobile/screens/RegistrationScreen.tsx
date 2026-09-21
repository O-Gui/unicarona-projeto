import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton, Button, Checkbox, Field, InfoBox } from '../components/ui';
import { colors, spacing, typography } from '../theme';
import { mascaras } from '../lib/format';
import { authService } from '../lib/servicos';
import { useNavigation } from '../state/NavigationContext';

const DOMINIO_INSTITUCIONAL = /^[^\s@]+@a\.ucb\.br$/i;

export function RegistrationScreen() {
  const { voltar, substituir } = useNavigation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [curso, setCurso] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceitou, setAceitou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const validar = () => {
    const encontrados: Record<string, string> = {};

    if (!nome.trim()) encontrados.nome = 'Informe seu nome completo.';
    if (!DOMINIO_INSTITUCIONAL.test(email.trim())) {
      encontrados.email = 'Use seu e-mail institucional @a.ucb.br.';
    }
    if (cpf.length !== 11) encontrados.cpf = 'O CPF precisa ter 11 dígitos.';
    if (!curso.trim()) encontrados.curso = 'Informe seu curso.';
    if (senha.length < 8) encontrados.senha = 'A senha deve ter pelo menos 8 caracteres.';
    if (senha !== confirmacao) encontrados.confirmacao = 'As senhas não são iguais.';
    if (!aceitou) encontrados.termos = 'Aceite os termos para criar sua conta.';

    setErros(encontrados);
    return Object.keys(encontrados).length === 0;
  };

  const submeter = async () => {
    if (!validar()) return;

    setEnviando(true);
    try {
      const resposta = await authService.registrar({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cpf,
        senha,
        curso: curso.trim(),
        universidade: 'Universidade Católica de Brasília',
      });

      substituir('verify-email', { email: resposta.usuario.email });
    } catch (falha) {
      setErros({ geral: falha instanceof Error ? falha.message : 'Não foi possível cadastrar.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={estilos.tela}>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={voltar} label="Voltar" />

        <Text style={estilos.titulo}>Criar conta</Text>
        <Text style={estilos.subtitulo}>Junte-se à comunidade universitária de caronas</Text>

        <View style={estilos.progresso}>
          <View style={estilos.progressoAtivo} />
          <View style={estilos.progressoInativo} />
          <View style={estilos.progressoInativo} />
        </View>
        <Text style={estilos.progressoTexto}>Passo 1 de 3 — seus dados</Text>

        <Field
          label="Nome completo"
          icone="users"
          placeholder="Seu nome completo"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          erro={erros.nome}
        />

        <Field
          label="E-mail institucional"
          icone="mail"
          placeholder="nome@a.ucb.br"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          ajuda="Usamos seu e-mail da UCB para confirmar que você é da comunidade."
          erro={erros.email}
        />

        <Field
          label="CPF"
          icone="credit-card"
          placeholder="00000000000"
          value={cpf}
          onChangeText={(valor) => setCpf(mascaras.cpf(valor))}
          keyboardType="numeric"
          erro={erros.cpf}
        />

        <Field
          label="Curso"
          icone="building"
          placeholder="Ex.: Engenharia de Software"
          value={curso}
          onChangeText={setCurso}
          autoCapitalize="words"
          erro={erros.curso}
        />

        <Field
          label="Senha"
          icone="lock"
          placeholder="Mínimo de 8 caracteres"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          erro={erros.senha}
        />

        <Field
          label="Confirmar senha"
          icone="lock"
          placeholder="Digite a senha novamente"
          value={confirmacao}
          onChangeText={setConfirmacao}
          secureTextEntry
          erro={erros.confirmacao}
        />

        <InfoBox icone="alert-circle">
          Seu cadastro começa como passageiro. Depois de cadastrar um veículo você também poderá
          oferecer caronas.
        </InfoBox>

        <Checkbox marcado={aceitou} onToggle={() => setAceitou((atual) => !atual)}>
          <Text style={estilos.termos}>
            Li e aceito os <Text style={estilos.link}>termos de uso</Text> e a{' '}
            <Text style={estilos.link}>política de privacidade</Text>.
          </Text>
        </Checkbox>
        {erros.termos ? <Text style={estilos.erro}>{erros.termos}</Text> : null}
        {erros.geral ? <Text style={estilos.erro}>{erros.geral}</Text> : null}
      </ScrollView>

      <View style={estilos.rodape}>
        <Button label="Continuar" onPress={submeter} carregando={enviando} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: spacing.xl, paddingTop: spacing.xxl },
  titulo: { ...typography.h1, color: colors.navy, marginTop: spacing.xl, marginBottom: spacing.xs },
  subtitulo: { ...typography.small, color: colors.mutedForeground, marginBottom: spacing.xl },

  progresso: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  progressoAtivo: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.orange },
  progressoInativo: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border },
  progressoTexto: { ...typography.caption, color: colors.mutedForeground, marginBottom: spacing.xl },

  termos: { ...typography.caption, color: colors.mutedForeground, lineHeight: 17 },
  link: { color: colors.orange, fontWeight: '700' },
  erro: { ...typography.caption, color: colors.destructive, marginTop: spacing.sm },

  rodape: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
