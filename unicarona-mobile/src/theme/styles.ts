import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const styles = StyleSheet.create({
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
