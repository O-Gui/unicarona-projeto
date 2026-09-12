import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Screen = 'login' | 'register' | 'profile' | 'car';
type Profile = 'PASSAGEIRO' | 'MOTORISTA' | 'AMBOS';

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
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [userName, setUserName] = useState('');
  const [profile, setProfile] = useState<Profile>('PASSAGEIRO');
  const [carSaved, setCarSaved] = useState(false);

  const navigate = (next: Screen) => setScreen(next);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={COLORS.navy} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {screen === 'login' && <LoginScreen onNavigate={navigate} onLogin={(name) => { setUserName(name); navigate('profile'); }} />}
        {screen === 'register' && <RegisterScreen onBack={() => navigate('login')} onRegistered={(name, selectedProfile) => { setUserName(name); setProfile(selectedProfile); navigate('profile'); }} />}
        {screen === 'profile' && <ProfileScreen name={userName || 'Maria Silva'} profile={profile} carSaved={carSaved} onNavigate={navigate} />}
        {screen === 'car' && <CarScreen onBack={() => navigate('profile')} onSaved={() => { setCarSaved(true); navigate('profile'); }} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.brandHeader, compact && styles.brandHeaderCompact]}>
      <View style={styles.brandMark}><Ionicons name="car-sport" size={compact ? 20 : 28} color={COLORS.white} /></View>
      <View>
        <Text style={[styles.brandName, compact && styles.brandNameCompact]}>UniCarona</Text>
        {!compact && <Text style={styles.brandTagline}>conectando caminhos</Text>}
      </View>
    </View>
  );
}

function LoginScreen({ onNavigate, onLogin }: { onNavigate: (screen: Screen) => void; onLogin: (name: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return Alert.alert('Preencha seus dados', 'Informe e-mail e senha para continuar.');
    setLoading(true);
    try {
      // TODO: conectar ao POST /auth/login quando o backend estiver acessível no dispositivo.
      // Em Expo Go, localhost aponta para o próprio celular; use EXPO_PUBLIC_API_URL com o IP da máquina.
      await AsyncStorage.setItem('unicarona.lastEmail', email.trim());
      onLogin(email.split('@')[0] || 'Usuário UniCarona');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
      <View style={styles.authTop}><BrandHeader /></View>
      <View style={styles.authCard}>
        <Text style={styles.eyebrow}>BEM-VINDO DE VOLTA</Text>
        <Text style={styles.title}>Entre na sua conta</Text>
        <Text style={styles.subtitle}>Sua próxima carona começa aqui.</Text>
        <Field label="E-mail institucional" value={email} onChangeText={setEmail} placeholder="nome@universidade.edu.br" keyboardType="email-address" icon="mail-outline" />
        <Field label="Senha" value={password} onChangeText={setPassword} placeholder="Digite sua senha" secureTextEntry={!showPassword} icon="lock-closed-outline" rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'} onRightIconPress={() => setShowPassword(!showPassword)} />
        <Pressable style={styles.forgot} onPress={() => Alert.alert('Recuperação de senha', 'O fluxo de recuperação será conectado ao backend.') }><Text style={styles.link}>Esqueci minha senha</Text></Pressable>
        <PrimaryButton label={loading ? 'Entrando...' : 'Entrar'} onPress={submit} disabled={loading} />
        <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>ou</Text><View style={styles.dividerLine} /></View>
        <OutlineButton icon="logo-google" label="Continuar com Google" onPress={() => Alert.alert('Em breve', 'Login social será configurado com o provedor da universidade.')} />
        <View style={styles.bottomPrompt}><Text style={styles.bodyText}>Ainda não tem uma conta? </Text><Pressable onPress={() => onNavigate('register')}><Text style={styles.link}>Criar conta</Text></Pressable></View>
      </View>
    </ScrollView>
  );
}

function RegisterScreen({ onBack, onRegistered }: { onBack: () => void; onRegistered: (name: string, profile: Profile) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile>('PASSAGEIRO');
  const [accepted, setAccepted] = useState(false);

  const submit = () => {
    if (!name.trim() || !email.trim() || cpf.replace(/\D/g, '').length !== 11 || password.length < 8) return Alert.alert('Confira seus dados', 'Preencha nome, e-mail, CPF válido e senha com pelo menos 8 caracteres.');
    if (!accepted) return Alert.alert('Termos de uso', 'Aceite os termos para criar sua conta.');
    // TODO: enviar os campos para POST /auth/register e abrir a verificação de e-mail (POST /auth/verify-email).
    onRegistered(name.trim(), selectedProfile);
  };

  return (
    <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
      <View style={styles.authTop}><Pressable onPress={onBack} style={styles.backButton}><Ionicons name="arrow-back" size={22} color={COLORS.white} /></Pressable><BrandHeader compact /></View>
      <View style={styles.authCard}>
        <Text style={styles.eyebrow}>FAÇA PARTE</Text><Text style={styles.title}>Crie sua conta</Text><Text style={styles.subtitle}>Só falta um caminho para começar.</Text>
        <Field label="Nome completo" value={name} onChangeText={setName} placeholder="Como podemos te chamar?" icon="person-outline" />
        <Field label="E-mail institucional" value={email} onChangeText={setEmail} placeholder="nome@universidade.edu.br" keyboardType="email-address" icon="mail-outline" />
        <Field label="CPF" value={cpf} onChangeText={setCpf} placeholder="000.000.000-00" keyboardType="numeric" icon="card-outline" />
        <Field label="Crie uma senha" value={password} onChangeText={setPassword} placeholder="Mínimo de 8 caracteres" secureTextEntry icon="lock-closed-outline" />
        <Text style={styles.fieldLabel}>Quero participar como</Text>
        <View style={styles.profileOptions}>{(['PASSAGEIRO', 'MOTORISTA', 'AMBOS'] as Profile[]).map((item) => <Pressable key={item} onPress={() => setSelectedProfile(item)} style={[styles.profileOption, selectedProfile === item && styles.profileOptionActive]}><Ionicons name={item === 'PASSAGEIRO' ? 'walk-outline' : item === 'MOTORISTA' ? 'car-outline' : 'people-outline'} size={19} color={selectedProfile === item ? COLORS.orange : COLORS.muted} /><Text style={[styles.profileOptionText, selectedProfile === item && styles.profileOptionTextActive]}>{item === 'PASSAGEIRO' ? 'Passageiro' : item === 'MOTORISTA' ? 'Motorista' : 'Ambos'}</Text></Pressable>)}</View>
        <Pressable style={styles.termsRow} onPress={() => setAccepted(!accepted)}><Ionicons name={accepted ? 'checkbox' : 'square-outline'} size={22} color={accepted ? COLORS.orange : COLORS.muted} /><Text style={styles.termsText}>Li e aceito os <Text style={styles.link}>termos de uso</Text> e a <Text style={styles.link}>política de privacidade</Text>.</Text></Pressable>
        <PrimaryButton label="Criar minha conta" onPress={submit} />
      </View>
    </ScrollView>
  );
}

function ProfileScreen({ name, profile, carSaved, onNavigate }: { name: string; profile: Profile; carSaved: boolean; onNavigate: (screen: Screen) => void }) {
  const firstName = useMemo(() => name.split(' ')[0], [name]);
  return <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}><View style={styles.pageHeader}><BrandHeader compact /><Pressable style={styles.headerIcon} onPress={() => Alert.alert('Notificações', 'Você está em dia!')}><Ionicons name="notifications-outline" size={23} color={COLORS.white} /></Pressable></View><View style={styles.profileHero}><View style={styles.avatar}><Text style={styles.avatarText}>{firstName.slice(0, 1).toUpperCase()}</Text></View><View style={styles.profileIdentity}><Text style={styles.greeting}>Olá, {firstName}!</Text><Text style={styles.profileRole}>{profile === 'AMBOS' ? 'Passageiro e motorista' : profile === 'MOTORISTA' ? 'Motorista' : 'Passageiro'}</Text></View><Pressable onPress={() => Alert.alert('Editar perfil', 'A edição de dados será conectada ao backend.')}><Ionicons name="create-outline" size={22} color={COLORS.navy} /></Pressable></View><View style={styles.statsRow}><Stat value="0" label="Caronas" /><Stat value="0" label="Avaliação" /><Stat value="0 kg" label="CO₂ evitado" /></View><Text style={styles.sectionTitle}>Seu perfil</Text><View style={styles.menuCard}><MenuItem icon="person-outline" title="Dados pessoais" subtitle="Nome, e-mail e CPF" onPress={() => Alert.alert('Dados pessoais', 'O formulário de edição estará disponível em breve.')} /><MenuItem icon="car-outline" title="Meu carro" subtitle={carSaved ? 'Veículo cadastrado' : 'Cadastre seu veículo'} onPress={() => onNavigate('car')} /><MenuItem icon="shield-checkmark-outline" title="Verificação de identidade" subtitle="Mantenha sua conta segura" onPress={() => Alert.alert('Verificação', 'Este fluxo será implementado na próxima etapa.')} /></View><PrimaryButton label={carSaved ? 'Adicionar outro carro' : 'Cadastrar meu carro'} onPress={() => onNavigate('car')} /><Pressable style={styles.logout} onPress={() => onNavigate('login')}><Ionicons name="log-out-outline" size={20} color={COLORS.danger} /><Text style={styles.logoutText}>Sair da conta</Text></Pressable></ScrollView>;
}

function CarScreen({ onBack, onSaved }: { onBack: () => void; onSaved: () => void }) {
  const [plate, setPlate] = useState(''); const [capacity, setCapacity] = useState(''); const [model, setModel] = useState('');
  const submit = () => { if (!plate.trim() || !capacity || !model.trim()) return Alert.alert('Complete o cadastro', 'Informe modelo, placa e quantidade de vagas.'); if (Number(capacity) < 1 || Number(capacity) > 4) return Alert.alert('Vagas inválidas', 'O backend aceita de 1 a 4 vagas.'); /* TODO: criar endpoint de veículo e enviar para o backend autenticado. */ onSaved(); };
  return <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}><View style={styles.pageHeader}><Pressable onPress={onBack} style={styles.headerIcon}><Ionicons name="arrow-back" size={23} color={COLORS.white} /></Pressable><BrandHeader compact /><View style={{ width: 40 }} /></View><View style={styles.formIntro}><View style={styles.orangeIcon}><Ionicons name="car-sport" size={30} color={COLORS.orange} /></View><Text style={styles.title}>Cadastre seu carro</Text><Text style={styles.subtitle}>Compartilhe o caminho e ajude mais pessoas a chegar.</Text></View><View style={styles.formCard}><Field label="Modelo do carro" value={model} onChangeText={setModel} placeholder="Ex.: Honda Civic" icon="car-outline" /><Field label="Placa" value={plate} onChangeText={(value: string) => setPlate(value.toUpperCase())} placeholder="ABC-1D23" autoCapitalize="characters" icon="card-outline" /><Field label="Vagas disponíveis" value={capacity} onChangeText={setCapacity} placeholder="Até 4 passageiros" keyboardType="number-pad" icon="people-outline" /><View style={styles.infoBox}><Ionicons name="information-circle-outline" size={20} color={COLORS.navyLight} /><Text style={styles.infoText}>A placa será usada apenas para identificação durante a carona. Seus dados ficam protegidos.</Text></View><PrimaryButton label="Salvar carro" onPress={submit} /></View></ScrollView>;
}

function Field({ label, value, onChangeText, placeholder, icon, rightIcon, onRightIconPress, ...props }: any) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><View style={styles.inputWrap}><Ionicons name={icon} size={20} color={COLORS.muted} /><TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#A9B6C2" {...props} /><Pressable disabled={!onRightIconPress} onPress={onRightIconPress}>{rightIcon && <Ionicons name={rightIcon} size={20} color={COLORS.muted} />}</Pressable></View></View>; }
function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, disabled && styles.disabled]}><Text style={styles.primaryButtonText}>{label}</Text><Ionicons name="arrow-forward" size={19} color={COLORS.white} /></Pressable>; }
function OutlineButton({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}><Ionicons name={icon} size={19} color={COLORS.navy} /><Text style={styles.outlineButtonText}>{label}</Text></Pressable>; }
function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function MenuItem({ icon, title, subtitle, onPress }: { icon: any; title: string; subtitle: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}><View style={styles.menuIcon}><Ionicons name={icon} size={21} color={COLORS.orange} /></View><View style={styles.menuCopy}><Text style={styles.menuTitle}>{title}</Text><Text style={styles.menuSubtitle}>{subtitle}</Text></View><Ionicons name="chevron-forward" size={20} color={COLORS.muted} /></Pressable>; }

const styles = StyleSheet.create({ flex: { flex: 1 }, safeArea: { flex: 1, backgroundColor: COLORS.navy }, authContent: { flexGrow: 1, backgroundColor: COLORS.canvas }, authTop: { backgroundColor: COLORS.navy, paddingHorizontal: 28, paddingTop: 34, paddingBottom: 54 }, brandHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 }, brandHeaderCompact: { justifyContent: 'center' }, brandMark: { width: 54, height: 54, borderRadius: 18, backgroundColor: COLORS.orange, alignItems: 'center', justifyContent: 'center' }, brandName: { color: COLORS.white, fontSize: 29, fontWeight: '800', letterSpacing: -0.7 }, brandNameCompact: { fontSize: 22 }, brandTagline: { color: '#B8C9D8', marginTop: 2, fontSize: 12 }, authCard: { backgroundColor: COLORS.white, marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 26, paddingTop: 30, paddingBottom: 40, flexGrow: 1 }, eyebrow: { color: COLORS.orange, fontWeight: '800', fontSize: 11, letterSpacing: 1.4, marginBottom: 8 }, title: { color: COLORS.navy, fontWeight: '800', fontSize: 28, letterSpacing: -0.6, lineHeight: 34 }, subtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginTop: 7, marginBottom: 25 }, field: { marginBottom: 16 }, fieldLabel: { color: COLORS.ink, fontSize: 13, fontWeight: '700', marginBottom: 8 }, inputWrap: { minHeight: 52, borderWidth: 1, borderColor: COLORS.line, borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10, backgroundColor: COLORS.white }, input: { flex: 1, color: COLORS.ink, fontSize: 15, paddingVertical: 13 }, forgot: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 22 }, link: { color: COLORS.orange, fontWeight: '700' }, primaryButton: { minHeight: 54, borderRadius: 14, backgroundColor: COLORS.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 5, shadowColor: COLORS.orange, shadowOpacity: 0.22, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 }, primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '800' }, pressed: { transform: [{ scale: 0.98 }], opacity: 0.88 }, disabled: { opacity: 0.6 }, divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 23 }, dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.line }, dividerText: { color: COLORS.muted, fontSize: 13 }, outlineButton: { borderWidth: 1, borderColor: COLORS.line, minHeight: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, outlineButtonText: { color: COLORS.navy, fontWeight: '700', fontSize: 15 }, bottomPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 }, bodyText: { color: COLORS.muted, fontSize: 14 }, backButton: { position: 'absolute', left: 26, top: 4, zIndex: 1, padding: 5 }, profileOptions: { flexDirection: 'row', gap: 8, marginBottom: 15 }, profileOption: { flex: 1, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 5 }, profileOptionActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orangeSoft }, profileOptionText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' }, profileOptionTextActive: { color: COLORS.orange }, termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 21 }, termsText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, flex: 1 }, page: { flex: 1, backgroundColor: COLORS.canvas }, pageContent: { paddingBottom: 40 }, pageHeader: { backgroundColor: COLORS.navy, minHeight: 105, paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, profileHero: { backgroundColor: COLORS.white, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 14 }, avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: COLORS.orangeSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.orange }, avatarText: { color: COLORS.orange, fontSize: 25, fontWeight: '800' }, profileIdentity: { flex: 1 }, greeting: { fontSize: 21, fontWeight: '800', color: COLORS.navy }, profileRole: { color: COLORS.muted, marginTop: 3, fontSize: 13 }, statsRow: { backgroundColor: COLORS.white, marginTop: 1, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: COLORS.line }, stat: { alignItems: 'center' }, statValue: { color: COLORS.navy, fontWeight: '800', fontSize: 18 }, statLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 }, sectionTitle: { color: COLORS.navy, fontWeight: '800', fontSize: 18, marginHorizontal: 24, marginTop: 26, marginBottom: 12 }, menuCard: { backgroundColor: COLORS.white, marginHorizontal: 20, borderRadius: 18, paddingHorizontal: 15, overflow: 'hidden' }, menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F5' }, menuIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: COLORS.orangeSoft, alignItems: 'center', justifyContent: 'center' }, menuCopy: { flex: 1 }, menuTitle: { color: COLORS.ink, fontWeight: '700', fontSize: 14 }, menuSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: 3 }, logout: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 22 }, logoutText: { color: COLORS.danger, fontWeight: '700' }, formIntro: { backgroundColor: COLORS.white, paddingHorizontal: 25, paddingTop: 28, paddingBottom: 20 }, orangeIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: COLORS.orangeSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 17 }, formCard: { backgroundColor: COLORS.white, marginTop: 1, padding: 25, paddingBottom: 35 }, infoBox: { backgroundColor: '#EEF5FA', borderRadius: 13, padding: 13, flexDirection: 'row', gap: 9, marginTop: 1, marginBottom: 20 }, infoText: { color: COLORS.navyLight, fontSize: 12, lineHeight: 18, flex: 1 } });
