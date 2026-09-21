import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  Edit,
  Check,
  type LucideIcon,
} from 'lucide-react-native';

const colors = {
  navy: '#1e2a4a',
  orange: '#ff7a1a',
  background: '#f8f9fb',
  card: '#ffffff',
  border: '#e5e7eb',
  muted: '#f1f3f6',
  mutedForeground: '#6b7280',
  white: '#ffffff',
  green: '#10b981',
};

type Stat = { label: string; value: string; icon: LucideIcon };
type Badge = { name: string; icon: string; color: string };
type Review = {
  name: string;
  rating: number;
  comment: string;
  date: string;
};

const stats: Stat[] = [
  { label: 'Caronas Oferecidas', value: '24', icon: MapPin },
  { label: 'Caronas Recebidas', value: '18', icon: Calendar },
  { label: 'Avaliação Média', value: '4.9', icon: Star },
];

const badges: Badge[] = [
  { name: 'Motorista Confiável', icon: '🚗', color: colors.orange },
  { name: 'Passageiro 5 Estrelas', icon: '⭐', color: colors.navy },
];

const reviews: Review[] = [
  {
    name: 'João Santos',
    rating: 5,
    comment: 'Excelente motorista! Muito pontual e educado.',
    date: '28 Abr',
  },
  {
    name: 'Ana Costa',
    rating: 5,
    comment: 'Ótima conversa e direção tranquila. Recomendo!',
    date: '25 Abr',
  },
];

const tags = ['Música ambiente', 'Pontual', 'Não fuma', 'Aceita pets'];

export function ProfileScreen({
  user,
  onBack,
  onNavigateToCar,
  onLogout,
}: {
  user: any;
  onBack: () => void;
  onNavigateToCar: () => void;
  onLogout: () => void;
}) {
  const insets = useSafeAreaInsets();

  // Estados preenchidos dinamicamente com o nome do utilizador logado
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.nome || 'Usuário');
  const [course, setCourse] = useState('Engenharia • 3º ano');
  const [bio, setBio] = useState(
    'Estudante de Engenharia que adora compartilhar caronas para o campus. Sempre pontual e gosto de música ambiente durante o trajeto.'
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={24} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name ? name[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <Pressable
              style={styles.editButton}
              hitSlop={8}
              onPress={() => setIsEditing(!isEditing)}
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
            >
              {isEditing ? (
                <Check size={14} color={colors.green} />
              ) : (
                <Edit size={14} color={colors.navy} />
              )}
            </Pressable>
          </View>

          {isEditing ? (
            <TextInput
              style={[styles.name, styles.nameInput]}
              value={name}
              onChangeText={setName}
              placeholder="O seu nome"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          ) : (
            <Text style={styles.name}>{name}</Text>
          )}

          {isEditing ? (
            <TextInput
              style={[styles.course, styles.courseInput]}
              value={course}
              onChangeText={setCourse}
              placeholder="O seu curso"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          ) : (
            <Text style={styles.course}>{course}</Text>
          )}

          <View style={styles.ratingRow}>
            <Star size={16} color={colors.orange} fill={colors.orange} />
            <Text style={styles.ratingValue}>4.9</Text>
            <Text style={styles.ratingCount}>(42 avaliações)</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.card, styles.statCard]}>
              <stat.icon
                size={20}
                color={colors.orange}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}
          >
            {badges.map((badge) => (
              <View key={badge.name} style={[styles.card, styles.badgeCard]}>
                <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                <Text style={[styles.badgeName, { color: badge.color }]}>
                  {badge.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Sobre */}
        <View style={[styles.card, styles.aboutCard]}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          
          {isEditing ? (
            <TextInput
              style={[styles.aboutText, styles.aboutInput]}
              value={bio}
              onChangeText={setBio}
              multiline
              placeholder="Fale um pouco sobre si..."
              placeholderTextColor={colors.mutedForeground}
            />
          ) : (
            <Text style={styles.aboutText}>{bio}</Text>
          )}

          {!isEditing && (
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {isEditing && (
            <Pressable 
              style={styles.saveButton} 
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.saveButtonText}>Guardar Alterações</Text>
            </Pressable>
          )}
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              Avaliações Recentes
            </Text>
            <Pressable hitSlop={8} accessibilityRole="button">
              <Text style={styles.seeAll}>Ver todas</Text>
            </Pressable>
          </View>

          <View style={styles.reviewsList}>
            {reviews.map((review) => (
              <View
                key={`${review.name}-${review.date}`}
                style={[styles.card, styles.reviewCard]}
              >
                <View style={styles.reviewTop}>
                  <View style={styles.reviewerRow}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerInitial}>
                        {review.name[0]}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.reviewerName}>{review.name}</Text>
                      <View style={styles.starsRow}>
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            color={colors.orange}
                            fill={colors.orange}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Botões do Rodapé: Cadastrar Carro e Sair da Conta */}
        <View style={styles.footerActions}>
          <Pressable style={styles.carButton} onPress={onNavigateToCar}>
            <Text style={styles.carButtonText}>Cadastrar meu carro →</Text>
          </Pressable>

          <Pressable style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Sair da conta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerCenter: {
    alignItems: 'center',
  },
  avatarWrapper: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '700',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  name: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  nameInput: {
    borderBottomWidth: 1,
    borderColor: colors.orange,
    minWidth: 200,
    textAlign: 'center',
    paddingVertical: 2,
  },
  course: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  courseInput: {
    borderBottomWidth: 1,
    borderColor: colors.orange,
    minWidth: 160,
    textAlign: 'center',
    paddingVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  ratingCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
  badgesContainer: {
    gap: 12,
    paddingBottom: 8,
  },
  badgeCard: {
    minWidth: 140,
    padding: 16,
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  aboutCard: {
    padding: 20,
    marginBottom: 24,
  },
  aboutText: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  aboutInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: colors.background,
  },
  saveButton: {
    backgroundColor: colors.orange,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.muted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: '500',
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  seeAll: {
    color: colors.orange,
    fontSize: 14,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    padding: 16,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  reviewerName: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewDate: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  reviewComment: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
  },
/* Novos estilos para os botões do rodapé */
    footerActions: {
      marginTop: 24,
      marginBottom: 32,
      gap: 16,
      alignItems: 'center',
    },
    carButton: {
      backgroundColor: colors.orange,
      width: '100%',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    carButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    logoutButton: {
      paddingVertical: 8,
    },
    logoutText: {
      color: '#dc2626',
      fontSize: 14,
      fontWeight: '600',
    },
  
});