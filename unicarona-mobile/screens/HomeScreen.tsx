import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, MapPin, Users, Clock } from 'lucide-react-native';

const colors = {
  navy: '#1e2a4a',
  orange: '#ff7a1a',
  background: '#f8f9fb',
  card: '#ffffff',
  border: '#e5e7eb',
  mutedForeground: '#6b7280',
  white: '#ffffff',
};

type Ride = {
  driver: string;
  from: string;
  to: string;
  time: string;
  seats: number;
  price: string;
};

const upcomingRides: Ride[] = [
  {
    driver: 'Maria Silva',
    from: 'Centro',
    to: 'Campus Norte',
    time: '08:30',
    seats: 2,
    price: 'R$ 5,00',
  },
  {
    driver: 'João Santos',
    from: 'Zona Sul',
    to: 'Campus Principal',
    time: '14:00',
    seats: 3,
    price: 'R$ 7,00',
  },
];

export function HomeScreen({
  user,
  onNavigate,
}: {
  user: any;
  onNavigate: (screen: string) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Olá,</Text>
            <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
          </View>
          <Pressable
            onPress={() => onNavigate('profile')}
            style={styles.avatarButton}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <Text style={styles.avatarText}>
              {user?.nome ? user.nome[0].toUpperCase() : 'U'}
            </Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={20} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Para onde você vai?"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => onNavigate('find-ride')}
            style={[styles.actionButton, { backgroundColor: colors.orange }]}
            accessibilityRole="button"
          >
            <MapPin size={24} color={colors.white} />
            <Text style={styles.actionLabel}>Buscar Carona</Text>
          </Pressable>
          <Pressable
            onPress={() => onNavigate('offer-ride')}
            style={[styles.actionButton, { backgroundColor: colors.navy }]}
            accessibilityRole="button"
          >
            <Users size={24} color={colors.white} />
            <Text style={styles.actionLabel}>Oferecer Carona</Text>
          </Pressable>
        </View>

        {/* Upcoming Rides */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rotas recentes</Text>
            <Pressable hitSlop={8} accessibilityRole="button">
              <Text style={styles.seeAll}>Ver todas</Text>
            </Pressable>
          </View>

          <View style={styles.ridesList}>
            {upcomingRides.map((ride) => (
              <Pressable
                key={`${ride.driver}-${ride.time}`}
                onPress={() => onNavigate('ride-details')}
                style={({ pressed }) => [
                  styles.rideCard,
                  pressed && styles.rideCardPressed,
                ]}
                accessibilityRole="button"
              >
                <View style={styles.rideTop}>
                  <View style={styles.driverRow}>
                    <View style={styles.driverAvatar}>
                      <Text style={styles.driverInitial}>{ride.driver[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.driverName}>{ride.driver}</Text>
                      <View style={styles.timeRow}>
                        <Clock size={12} color={colors.mutedForeground} />
                        <Text style={styles.smallMuted}>{ride.time}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.price}>{ride.price}</Text>
                </View>

                <View style={styles.routeRow}>
                  <View style={styles.routeFrom}>
                    <View style={styles.routeDot} />
                    <Text style={styles.routeText} numberOfLines={1}>
                      {ride.from}
                    </Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routeTo}>
                    <MapPin size={14} color={colors.navy} />
                    <Text style={styles.routeText} numberOfLines={1}>
                      {ride.to}
                    </Text>
                  </View>
                </View>

                <View style={styles.seatsRow}>
                  <Users size={12} color={colors.mutedForeground} />
                  <Text style={styles.smallMuted}>
                    {ride.seats} vagas disponíveis
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  userName: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.navy,
    padding: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    color: colors.orange,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
    gap: 8,
  },
  actionLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  ridesList: {
    gap: 12,
  },
  rideCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rideCardPressed: {
    opacity: 0.85,
  },
  rideTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInitial: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  driverName: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '700',
  },
  smallMuted: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeFrom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeTo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },
  routeLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  routeText: {
    flexShrink: 1,
    color: colors.mutedForeground,
    fontSize: 14,
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
});