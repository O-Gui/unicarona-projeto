import { CarScreen, type Car as CarType } from './screens/CarScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ProfileScreen } from './screens/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Screen =
  | 'splash'
  | 'login'
  | 'register'
  | 'verify'
  | 'forgotPassword'
  | 'verifyPasswordReset'
  | 'resetPassword'
  | 'profile'
  | 'car'
  | 'home';
type Profile = 'PASSAGEIRO' | 'MOTORISTA' | 'AMBOS';
type User = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  perfil: Profile;
  emailValidado: boolean;
};
type AuthResponse = { accessToken: string; tokenType: string; usuario: User };
type RegisterResponse = { message: string; usuario: User };
type Car = { model: string; plate: string; capacity: number };

const COLORS = {
  navy: '#0B2A4A',
  navyLight: '#163F68',
  orange: '#F28C18',
  orangeSoft: '#FFF2DF',
  ink: '#172B3A',
  muted: '#718096',
  line: '#DCE5EC',
  canvas: '#F7F9FB',
  white: '#FFFFFF',
  danger: '#C53B3B',
  success: '#2F855A',
};

// Como está agora (com aspas duplicadas):
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.2:3000';

function friendlyErrorMessage(message: unknown, fallback: string) {
  const raw = Array.isArray(message) ? message.join(' ') : String(message ?? '');
  const lower = raw.toLowerCase();

  if (lower.includes('email must be an email')) return 'Informe um e-mail válido.';
  if (lower.includes('email should not be empty')) return 'Informe seu e-mail institucional.';
  if (lower.includes('senha should not be empty')) return 'Informe sua senha.';
  if (lower.includes('cpf should not be empty')) return 'Informe seu CPF.';
  if (lower.includes('nome should not be empty')) return 'Informe seu nome.';
  if (lower.includes('senha must be longer than or equal to 8')) return 'A senha deve ter pelo menos 8 caracteres.';
  if (lower.includes('cpf must be')) return 'Informe um CPF válido.';
  if (lower.includes('email must be')) return 'Informe um e-mail válido.';
  if (lower.includes('network request failed')) return 'Não foi possível conectar ao servidor.';
  if (lower.includes('failed to fetch')) return 'Não foi possível conectar ao servidor.';

  return raw || fallback;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(friendlyErrorMessage(data?.message, `Não foi possível concluir a operação. Código ${response.status}.`));
  }

  return data as T;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [car, setCar] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [storedUser, storedToken] = await Promise.all([
          AsyncStorage.getItem('unicarona.user'),
          AsyncStorage.getItem('unicarona.accessToken'),
        ]);

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          const storedCar = await AsyncStorage.getItem(`unicarona.car.${parsedUser.id}`);
          if (storedCar) setCar(JSON.parse(storedCar) as Car);
          setScreen('profile');
        }
      } catch {
        await AsyncStorage.multiRemove(['unicarona.user', 'unicarona.accessToken']);
      } finally {
        setReady(true);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = async (response: AuthResponse) => {
    await AsyncStorage.setItem('unicarona.accessToken', response.accessToken);
    await AsyncStorage.setItem('unicarona.user', JSON.stringify(response.usuario));
    const storedCar = await AsyncStorage.getItem(`unicarona.car.${response.usuario.id}`);
    setCar(storedCar ? (JSON.parse(storedCar) as Car) : null);
    setUser(response.usuario);
    setScreen('profile');
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['unicarona.accessToken', 'unicarona.user']);
    setUser(null);
    setCar(null);
    setScreen('login');
  };

  const saveCar = async (newCar: Car) => {
    if (!user) return;
    await AsyncStorage.setItem(`unicarona.car.${user.id}`, JSON.stringify(newCar));
    setCar(newCar);
    setScreen('profile');
    Alert.alert('Carro cadastrado', 'Os dados do seu carro foram salvos neste dispositivo.');
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingMark}>
            <Ionicons name="car-sport" size={30} color={COLORS.white} />
          </View>
          <Text style={styles.loadingTitle}>UniCarona</Text>
          <Text style={styles.loadingText}>Carregando seu acesso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {screen === 'splash' && (<SplashScreen onComplete={() => setScreen('login')}/>)}
        {screen === 'login' && <LoginScreen onNavigate={setScreen} onLogin={handleLogin} />}
        {screen === 'register' && (
          <RegisterScreen
            onBack={() => setScreen('login')}
            onRegistered={(email) => {
              setPendingEmail(email);
              setScreen('verify');
            }}
          />
        )}
        {screen === 'verify' && (
          <VerifyEmailScreen
            email={pendingEmail}
            onVerified={() => setScreen('login')}
          />
        )}
      {screen === 'forgotPassword' && (
        <ForgotPasswordScreen
          onBack={() => setScreen('login')}
          onContinue={(email) => {
            setResetEmail(email);
            setScreen('verifyPasswordReset');
          }}
        />
      )}

      {screen === 'verifyPasswordReset' && (
        <VerifyPasswordResetScreen
          email={resetEmail}
          onBack={() => setScreen('forgotPassword')}
          onVerified={(code) => {
            setResetCode(code);
            setScreen('resetPassword');
          }}
        />
      )}

      {screen === 'resetPassword' && (
        <ResetPasswordScreen
          email={resetEmail}
          code={resetCode}
          onBack={() => setScreen('verifyPasswordReset')}
          onReset={() => setScreen('login')}
        />
      )}
        
 {screen === 'home' && (
  <HomeScreen
    user={user}
    onNavigate={(nextScreen) => setScreen(nextScreen as any)}
  />
)}

{screen === 'profile' && (
  <ProfileScreen
    user={user}
    onBack={() => setScreen('home')}
    onNavigateToCar={() => setScreen('car')}
    onLogout={() => {
      setUser(null);
      setScreen('login');
    }}
  />

)}
        
{screen === 'car' && (
  <CarScreen
    existingCar={car}
    onBack={() => setScreen('profile')}
    onSaved={async (newCar) => {
      try {
        const response = await fetch('http://localhost:3000/veiculos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId: user?.id, // ID do utilizador logado atualmente
            modelo: newCar.model,
            placa: newCar.plate,
            capacidade: newCar.capacity,
          }),
        });

        if (!response.ok) throw new Error('Erro ao salvar no servidor');

        const data = await response.json();
        setCar(data);
        setScreen('profile');
      } catch (error) {
        console.error(error);
        alert('Erro ao guardar o veículo na base de dados.');
      }
    }}
  />
)}
      </KeyboardAvoidingView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}
function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.brandHeader, compact && styles.brandHeaderCompact]}>
      <View style={styles.brandMark}>
        <Ionicons name="car-sport" size={compact ? 20 : 28} color={COLORS.white} />
      </View>
      <View>
        <Text style={[styles.brandName, compact && styles.brandNameCompact]}>UniCarona</Text>
        {!compact && <Text style={styles.brandTagline}>conectando caminhos</Text>}
      </View>
    </View>
  );
}
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <View style={styles.splashScreen}>
      <View style={styles.splashContent}>
        <View style={styles.splashIcon}>
          <Ionicons
            name="car-sport"
            size={64}
            color={COLORS.orange}
          />
        </View>

        <Text style={styles.splashTitle}>
          UniCarona
        </Text>

        <Text style={styles.splashSubtitle}>
          Compartilhe caronas com sua universidade
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.splashButton,
          pressed && styles.pressed,
        ]}
        onPress={onComplete}
      >
        <Text style={styles.splashButtonText}>
          Começar
        </Text>

        <Ionicons
          name="arrow-forward"
          size={19}
          color={COLORS.white}
        />
      </Pressable>
    </View>
  );
}

function LoginScreen({
  onNavigate,
  onLogin,
}: {
  onNavigate: (screen: Screen) => void;
  onLogin: (response: AuthResponse) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert('Preencha seus dados', 'Informe e-mail e senha para continuar.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, senha: password }),
      });
      await onLogin(response);
    } catch (error) {
      Alert.alert(
        'Não foi possível entrar',
        friendlyErrorMessage(error instanceof Error ? error.message : '', 'Verifique o e-mail e a senha e tente novamente.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <ScrollView
    contentContainerStyle={styles.loginContent}
    keyboardShouldPersistTaps="handled"
  >
    <View style={styles.loginHeader}>
      <BrandHeader compact />
    </View>

    <View style={styles.loginCard}>
      <View style={styles.loginIntro}>
        <Text style={styles.loginTitle}>
          Bem-vindo de volta!
        </Text>

        <Text style={styles.loginSubtitle}>
          Entre para encontrar sua carona
        </Text>
      </View>

      <Field
        label="E-mail institucional"
        value={email}
        onChangeText={setEmail}
        placeholder="nome@a.ucb.br"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        icon="mail-outline"
      />

      <Field
        label="Senha"
        value={password}
        onChangeText={setPassword}
        placeholder="Digite sua senha"
        secureTextEntry={!showPassword}
        icon="lock-closed-outline"
        rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setShowPassword(!showPassword)}
      />

      <Pressable
        style={styles.loginForgot}
        onPress={() => onNavigate('forgotPassword')}
      >
        <Text style={styles.link}>
          Esqueci minha senha
        </Text>
      </Pressable>

      <PrimaryButton
        label={loading ? 'Entrando...' : 'Entrar'}
        onPress={submit}
        disabled={loading}
      />

      <View style={styles.loginBottom}>
        <Text style={styles.bodyText}>
          Ainda não tem uma conta?{' '}
        </Text>

        <Pressable onPress={() => onNavigate('register')}>
          <Text style={styles.link}>
            Criar conta
          </Text>
        </Pressable>
      </View>
    </View>
  </ScrollView>
);
}

function ForgotPasswordScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      Alert.alert(
        'Informe seu e-mail',
        'Digite seu e-mail institucional para continuar.',
      );
      return;
    }

    if (!/^[^\s@]+@a\.ucb\.br$/i.test(cleanEmail)) {
      Alert.alert(
        'E-mail inválido',
        'Use seu e-mail institucional @a.ucb.br.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<{ message: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({
            email: cleanEmail,
          }),
        },
      );

      Alert.alert('Código enviado', response.message, [
        {
          text: 'Continuar',
          onPress: () => onContinue(cleanEmail),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Não foi possível continuar',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Verifique o e-mail informado e tente novamente.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.authContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.authTop}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.white}
          />
        </Pressable>

        <BrandHeader compact />
      </View>

      <View style={styles.authCard}>
        <Text style={styles.eyebrow}>RECUPERAÇÃO DE ACESSO</Text>

        <Text style={styles.title}>
          Esqueceu sua senha?
        </Text>

        <Text style={styles.subtitle}>
          Informe seu e-mail institucional e enviaremos um
          código para redefinir sua senha.
        </Text>

        <Field
          label="E-mail institucional"
          value={email}
          onChangeText={setEmail}
          placeholder="nome@a.ucb.br"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          icon="mail-outline"
        />

        <PrimaryButton
          label={loading ? 'Enviando...' : 'Enviar código'}
          onPress={submit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

function RegisterScreen({
  onBack,
  onRegistered,
}: {
  onBack: () => void;
  onRegistered: (email: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [course, setCourse] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCpf = cpf.replace(/\D/g, '');

    if (
      !name.trim() ||
      !cleanEmail ||
      cleanCpf.length !== 11 ||
      !course.trim() ||
      password.length < 8
    ) {
      Alert.alert(
        'Confira seus dados',
        'Preencha nome, e-mail institucional, CPF, curso e uma senha com pelo menos 8 caracteres.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Senhas diferentes',
        'A senha e a confirmação de senha precisam ser iguais.',
      );
      return;
    }

    if (!accepted) {
      Alert.alert('Termos de uso', 'Aceite os termos para criar sua conta.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nome: name.trim(),
          email: cleanEmail,
          cpf: cleanCpf,
          senha: password,
          perfil: 'PASSAGEIRO',
        }),
      });

      Alert.alert('Cadastro realizado', response.message, [
        {
          text: 'Continuar',
          onPress: () => onRegistered(response.usuario.email),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Não foi possível cadastrar',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Verifique os dados informados e tente novamente.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.authContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.authTop}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </Pressable>

        <BrandHeader compact />
      </View>

      <View style={styles.authCard}>
        <Text style={styles.eyebrow}>FAÇA PARTE</Text>

        <Text style={styles.title}>Crie sua conta</Text>

        <Text style={styles.subtitle}>
          Junte-se à comunidade universitária de caronas.
        </Text>

        {/* PROGRESSO */}
        <View style={styles.progressContainer}>
          <View style={styles.progressActive} />
          <View style={styles.progressInactive} />
          <View style={styles.progressInactive} />
        </View>

        <Text style={styles.progressText}>Passo 1 de 3</Text>

        <Field
          label="Nome completo"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome completo"
          icon="person-outline"
          autoCapitalize="words"
        />

        <Field
          label="E-mail institucional"
          value={email}
          onChangeText={setEmail}
          placeholder="nome@a.ucb.br"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          icon="mail-outline"
        />

        <Text style={styles.helperText}>
          Use seu e-mail institucional da Universidade Católica de Brasília.
        </Text>

        <Field
          label="CPF"
          value={cpf}
          onChangeText={(value: string) =>
            setCpf(value.replace(/\D/g, '').slice(0, 11))
          }
          placeholder="00000000000"
          keyboardType="numeric"
          icon="card-outline"
        />

        <Field
          label="Curso"
          value={course}
          onChangeText={setCourse}
          placeholder="Ex.: Engenharia de Software"
          icon="school-outline"
          autoCapitalize="words"
        />

        <Field
          label="Crie uma senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo de 8 caracteres"
          secureTextEntry
          icon="lock-closed-outline"
        />

        <Field
          label="Confirmar senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirme sua senha"
          secureTextEntry
          icon="lock-closed-outline"
        />

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.navyLight}
          />

          <Text style={styles.infoText}>
            Seu cadastro começa como{' '}
            <Text style={styles.infoStrong}>passageiro</Text>. Depois você
            poderá oferecer caronas e cadastrar seu veículo.
          </Text>
        </View>

        <Pressable
          style={styles.termsRow}
          onPress={() => setAccepted(!accepted)}
        >
          <Ionicons
            name={accepted ? 'checkbox' : 'square-outline'}
            size={22}
            color={accepted ? COLORS.orange : COLORS.muted}
          />

          <Text style={styles.termsText}>
            Li e aceito os{' '}
            <Text style={styles.link}>termos de uso</Text> e a{' '}
            <Text style={styles.link}>política de privacidade</Text>.
          </Text>
        </Pressable>

        <PrimaryButton
          label={loading ? 'Criando conta...' : 'Continuar'}
          onPress={submit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}
function VerifyPasswordResetScreen({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: (code: string) => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      Alert.alert(
        'Código inválido',
        'Digite o código de 6 dígitos enviado para seu e-mail.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<{ message: string }>(
        '/auth/verify-password-reset',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            codigo: code,
          }),
        },
      );

      Alert.alert('Código confirmado', response.message, [
        {
          text: 'Continuar',
          onPress: () => onVerified(code),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Código inválido',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'O código é inválido ou expirou.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.authContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.authTop}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.white}
          />
        </Pressable>

        <BrandHeader compact />
      </View>

      <View style={styles.authCard}>
        <Text style={styles.eyebrow}>QUASE LÁ</Text>

        <Text style={styles.title}>
          Confirme o código
        </Text>

        <Text style={styles.subtitle}>
          Enviamos um código de 6 dígitos para {email}.
        </Text>

        <Field
          label="Código de recuperação"
          value={code}
          onChangeText={(value: string) =>
            setCode(value.replace(/\D/g, '').slice(0, 6))
          }
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          icon="shield-checkmark-outline"
        />

        <PrimaryButton
          label={loading ? 'Validando...' : 'Confirmar código'}
          onPress={verify}
          disabled={loading}
        />

        <Text style={styles.centerHint}>
          O código expira em poucos minutos.
        </Text>
      </View>
    </ScrollView>
  );
}
function ResetPasswordScreen({
  email,
  code,
  onBack,
  onReset,
}: {
  email: string;
  code: string;
  onBack: () => void;
  onReset: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password.length < 8) {
      Alert.alert(
        'Senha inválida',
        'A senha deve ter pelo menos 8 caracteres.',
      );
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      Alert.alert(
        'Senha inválida',
        'A senha deve conter pelo menos uma letra e um número.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Senhas diferentes',
        'As senhas informadas precisam ser iguais.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<{ message: string }>(
        '/auth/reset-password',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            codigo: code,
            novaSenha: password,
          }),
        },
      );

      Alert.alert(
        'Senha redefinida',
        response.message,
        [
          {
            text: 'Voltar para o login',
            onPress: onReset,
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Não foi possível redefinir',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Não foi possível redefinir sua senha. Tente novamente.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.authContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.authTop}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.white}
          />
        </Pressable>

        <BrandHeader compact />
      </View>

      <View style={styles.authCard}>
        <Text style={styles.eyebrow}>NOVA SENHA</Text>

        <Text style={styles.title}>
          Crie uma nova senha
        </Text>

        <Text style={styles.subtitle}>
          Escolha uma senha segura para voltar a acessar sua conta.
        </Text>

        <Field
          label="Nova senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo de 8 caracteres"
          secureTextEntry={!showPassword}
          icon="lock-closed-outline"
          rightIcon={
            showPassword
              ? 'eye-off-outline'
              : 'eye-outline'
          }
          onRightIconPress={() =>
            setShowPassword(!showPassword)
          }
        />

        <Field
          label="Confirme sua nova senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Digite a senha novamente"
          secureTextEntry={!showConfirmPassword}
          icon="lock-closed-outline"
          rightIcon={
            showConfirmPassword
              ? 'eye-off-outline'
              : 'eye-outline'
          }
          onRightIconPress={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
        />

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.navyLight}
          />

          <Text style={styles.infoText}>
            Use pelo menos 8 caracteres, contendo uma letra e
            um número.
          </Text>
        </View>

        <PrimaryButton
          label={loading ? 'Salvando...' : 'Redefinir senha'}
          onPress={submit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

function VerifyEmailScreen({
  email,
  onVerified,
}: {
  email: string;
  onVerified: () => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      Alert.alert(
        'Código inválido',
        'Digite o código de 6 dígitos enviado para seu e-mail.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<{ message: string }>(
        '/auth/verify-email',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            codigo: code,
          }),
        },
      );

      Alert.alert('E-mail validado', response.message, [
        {
          text: 'Entrar',
          onPress: onVerified,
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Não foi possível validar',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Código inválido ou expirado.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);

    try {
      const response = await apiRequest<{ message: string }>(
        '/auth/resend-verification',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
      );

      Alert.alert('Código reenviado', response.message);
    } catch (error) {
      Alert.alert(
        'Não foi possível reenviar',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Tente novamente em alguns instantes.',
        ),
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.verifyScreen}>
      <View style={styles.verifyTop}>
        <Pressable onPress={onVerified} style={styles.verifyBackButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.navy}
          />
        </Pressable>
      </View>

      <View style={styles.verifyContent}>
        <View style={styles.verifyIcon}>
          <Ionicons
            name="mail-outline"
            size={40}
            color={COLORS.orange}
          />
        </View>

        <Text style={styles.verifyTitle}>
          Verifique seu e-mail
        </Text>

        <Text style={styles.verifySubtitle}>
          Enviamos um código de 6 dígitos para{' '}
          <Text style={styles.verifyEmail}>
            {email}
          </Text>
        </Text>

        <View style={styles.otpContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.otpBox,
                code.length === index && styles.otpBoxActive,
              ]}
            >
              <Text style={styles.otpText}>
                {code[index] ?? ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Campo invisível usado para receber o código */}
        <TextInput
          value={code}
          onChangeText={(value: string) =>
            setCode(value.replace(/\D/g, '').slice(0, 6))
          }
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          style={styles.otpInput}
        />

        <View style={styles.verifyActions}>
          <PrimaryButton
            label={loading ? 'Verificando...' : 'Verificar'}
            onPress={verify}
            disabled={loading}
          />

          <Pressable
            onPress={resend}
            disabled={resending}
            style={styles.resendButtonNew}
          >
            <Ionicons
              name="refresh-outline"
              size={17}
              color={COLORS.orange}
            />

            <Text style={styles.resendText}>
              {resending ? 'Enviando...' : 'Reenviar código'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.verifyHint}>
          Não recebeu o e-mail? Verifique sua caixa de spam.
        </Text>
      </View>
    </View>
  );
}



function Field({ label, value, onChangeText, placeholder, icon, rightIcon, onRightIconPress, ...props }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={20} color={COLORS.muted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A9B6C2"
          {...props}
        />
        <Pressable disabled={!onRightIconPress} onPress={onRightIconPress} style={styles.inputAction}>
          {rightIcon && <Ionicons name={rightIcon} size={20} color={COLORS.muted} />}
        </Pressable>
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Ionicons name="arrow-forward" size={19} color={COLORS.white} />
    </Pressable>
  );
}

function OutlineButton({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={19} color={COLORS.navy} />
      <Text style={styles.outlineButtonText}>{label}</Text>
    </Pressable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, title, subtitle, onPress }: { icon: any; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={21} color={COLORS.orange} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: COLORS.navy },
  loadingScreen: { flex: 1, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center' },
  loadingMark: { width: 64, height: 64, borderRadius: 20, backgroundColor: COLORS.orange, alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { color: COLORS.white, fontSize: 26, fontWeight: '800', marginTop: 14 },
  loadingText: { color: '#B8C9D8', fontSize: 14, marginTop: 6 },
  authContent: { flexGrow: 1, backgroundColor: COLORS.canvas },
  authTop: { backgroundColor: COLORS.navy, paddingHorizontal: 28, paddingTop: 34, paddingBottom: 54 },
  brandHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandHeaderCompact: { justifyContent: 'center' },
  brandMark: { width: 54, height: 54, borderRadius: 18, backgroundColor: COLORS.orange, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: COLORS.white, fontSize: 29, fontWeight: '800', letterSpacing: -0.7 },
  brandNameCompact: { fontSize: 22 },
  brandTagline: { color: '#B8C9D8', marginTop: 2, fontSize: 12 },
  authCard: { backgroundColor: COLORS.white, marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 26, paddingTop: 30, paddingBottom: 40, flexGrow: 1 },
  eyebrow: { color: COLORS.orange, fontWeight: '800', fontSize: 11, letterSpacing: 1.4, marginBottom: 8 },
  title: { color: COLORS.navy, fontWeight: '800', fontSize: 28, letterSpacing: -0.6, lineHeight: 34 },
  subtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginTop: 7, marginBottom: 25 },
  field: { marginBottom: 16 },
  fieldLabel: { color: COLORS.ink, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  inputWrap: { minHeight: 52, borderWidth: 1, borderColor: COLORS.line, borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10, backgroundColor: COLORS.white },
  input: { flex: 1, color: COLORS.ink, fontSize: 15, paddingVertical: 13 },
  inputAction: { minWidth: 24, alignItems: 'flex-end', justifyContent: 'center' },
  forgot: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 22 },
  link: { color: COLORS.orange, fontWeight: '700' },
  primaryButton: { minHeight: 54, borderRadius: 14, backgroundColor: COLORS.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 5, shadowColor: COLORS.orange, shadowOpacity: 0.22, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.88 },
  disabled: { opacity: 0.6 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 23 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.line },
  dividerText: { color: COLORS.muted, fontSize: 13 },
  outlineButton: { borderWidth: 1, borderColor: COLORS.line, minHeight: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  outlineButtonText: { color: COLORS.navy, fontWeight: '700', fontSize: 15 },
  bottomPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  bodyText: { color: COLORS.muted, fontSize: 14 },
  backButton: { position: 'absolute', left: 26, top: 4, zIndex: 1, padding: 5 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 21 },
  termsText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, flex: 1 },
  infoBox: { backgroundColor: '#EEF5FA', borderRadius: 13, padding: 13, flexDirection: 'row', gap: 9, marginTop: 1, marginBottom: 20 },
  infoText: { color: COLORS.navyLight, fontSize: 12, lineHeight: 18, flex: 1 },
  infoStrong: { fontWeight: '800' },
  resendButton: { alignItems: 'center', marginTop: 20 },
  centerHint: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginTop: 14 },
  page: { flex: 1, backgroundColor: COLORS.canvas },
  pageContent: { paddingBottom: 40 },
  pageHeader: { backgroundColor: COLORS.navy, minHeight: 105, paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  profileHero: { backgroundColor: COLORS.white, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: COLORS.orangeSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.orange },
  avatarText: { color: COLORS.orange, fontSize: 25, fontWeight: '800' },
  profileIdentity: { flex: 1 },
  greeting: { fontSize: 21, fontWeight: '800', color: COLORS.navy },
  profileRole: { color: COLORS.muted, marginTop: 3, fontSize: 13 },
  profileEmail: { color: COLORS.muted, marginTop: 2, fontSize: 12 },
  statsRow: { backgroundColor: COLORS.white, marginTop: 1, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: COLORS.line },
  stat: { alignItems: 'center' },
  statValue: { color: COLORS.navy, fontWeight: '800', fontSize: 18 },
  statLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  sectionTitle: { color: COLORS.navy, fontWeight: '800', fontSize: 18, marginHorizontal: 24, marginTop: 26, marginBottom: 12 },
  menuCard: { backgroundColor: COLORS.white, marginHorizontal: 20, borderRadius: 18, paddingHorizontal: 15, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F5' },
  menuPressed: { opacity: 0.7 },
  menuIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: COLORS.orangeSoft, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1 },
  menuTitle: { color: COLORS.ink, fontWeight: '700', fontSize: 14 },
  menuSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  carSummary: { backgroundColor: COLORS.white, marginHorizontal: 20, marginTop: 12, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: COLORS.line },
  carSummaryIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: COLORS.orangeSoft, alignItems: 'center', justifyContent: 'center' },
  carSummaryCopy: { flex: 1 },
  carSummaryTitle: { color: COLORS.ink, fontWeight: '800', fontSize: 14 },
  carSummaryText: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  editCar: { color: COLORS.orange, fontWeight: '800', fontSize: 13 },
  logout: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 22 },
  logoutText: { color: COLORS.danger, fontWeight: '700' },
  formIntro: { backgroundColor: COLORS.white, paddingHorizontal: 25, paddingTop: 28, paddingBottom: 20 },
  orangeIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: COLORS.orangeSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  formCard: { backgroundColor: COLORS.white, marginTop: 1, padding: 25, paddingBottom: 35 },
  savedBanner: { margin: 20, marginBottom: 0, backgroundColor: '#EEF8F2', borderRadius: 14, padding: 13, flexDirection: 'row', gap: 10, alignItems: 'center' },
  savedBannerCopy: { flex: 1 },
  savedBannerTitle: { color: COLORS.success, fontWeight: '800', fontSize: 13 },
  savedBannerText: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },

  progressActive: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.orange,
  },

  progressInactive: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.line,
  },

  progressText: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 20,
  },

  helperText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: -9,
    marginBottom: 15,
    paddingHorizontal: 2,
  },

    verifyScreen: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },

  verifyTop: {
    paddingHorizontal: 24,
    paddingTop: 45,
    paddingBottom: 10,
  },

  verifyBackButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 70,
  },

  verifyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  verifyTitle: {
    color: COLORS.navy,
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },

  verifySubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 330,
    marginBottom: 28,
  },

  verifyEmail: {
    color: COLORS.navy,
    fontWeight: '700',
  },

  otpContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },

  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  otpBoxActive: {
    borderColor: COLORS.orange,
  },

  otpText: {
    color: COLORS.navy,
    fontSize: 21,
    fontWeight: '800',
  },

  otpInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },

  verifyActions: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },

  resendButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 18,
    padding: 8,
  },

  resendText: {
    color: COLORS.orange,
    fontSize: 14,
    fontWeight: '700',
  },

  verifyHint: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 28,
  },
    loginContent: {
    flexGrow: 1,
    backgroundColor: COLORS.canvas,
  },

  loginHeader: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 45,
  },

  loginCard: {
    backgroundColor: COLORS.white,
    marginTop: -20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 35,
    flexGrow: 1,
  },

  loginIntro: {
    marginBottom: 30,
  },

  loginTitle: {
    color: COLORS.navy,
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 35,
    marginBottom: 7,
  },

  loginSubtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
  },

  loginForgot: {
    alignSelf: 'flex-end',
    marginTop: -3,
    marginBottom: 22,
  },

  loginBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
    splashScreen: {
    flex: 1,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  splashContent: {
    alignItems: 'center',
  },

  splashIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },

  splashTitle: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  splashSubtitle: {
    color: '#B8C9D8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },

  splashButton: {
    position: 'absolute',
    bottom: 45,
    minWidth: 180,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  splashButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
