import React from 'react';
import { Ionicons } from '@expo/vector-icons';

/**
 * O protótipo web usa nomes de ícone do lucide-react. Aqui eles são traduzidos
 * para Ionicons (já presente no projeto) num único mapa, para que as telas
 * fiquem com os mesmos nomes do design. Para trocar por lucide-react-native
 * depois, basta reescrever este arquivo.
 */
export type NomeIcone =
  | 'alert-circle'
  | 'arrow-left'
  | 'arrow-right'
  | 'award'
  | 'bell'
  | 'building'
  | 'calendar'
  | 'camera'
  | 'car'
  | 'check'
  | 'check-circle'
  | 'chevron-right'
  | 'clock'
  | 'credit-card'
  | 'dollar-sign'
  | 'edit'
  | 'eye'
  | 'eye-off'
  | 'filter'
  | 'help-circle'
  | 'leaf'
  | 'lock'
  | 'log-out'
  | 'mail'
  | 'map-pin'
  | 'message-circle'
  | 'more-vertical'
  | 'phone'
  | 'refresh'
  | 'search'
  | 'send'
  | 'settings'
  | 'share'
  | 'shield'
  | 'sliders'
  | 'star'
  | 'star-outline'
  | 'trash'
  | 'trending-up'
  | 'upload'
  | 'users'
  | 'x';

const MAPA: Record<NomeIcone, keyof typeof Ionicons.glyphMap> = {
  'alert-circle': 'alert-circle-outline',
  'arrow-left': 'arrow-back',
  'arrow-right': 'arrow-forward',
  award: 'ribbon-outline',
  bell: 'notifications-outline',
  building: 'business-outline',
  calendar: 'calendar-outline',
  camera: 'camera-outline',
  car: 'car-sport',
  check: 'checkmark',
  'check-circle': 'checkmark-circle',
  'chevron-right': 'chevron-forward',
  clock: 'time-outline',
  'credit-card': 'card-outline',
  'dollar-sign': 'cash-outline',
  edit: 'create-outline',
  eye: 'eye-outline',
  'eye-off': 'eye-off-outline',
  filter: 'funnel-outline',
  'help-circle': 'help-circle-outline',
  leaf: 'leaf-outline',
  lock: 'lock-closed-outline',
  'log-out': 'log-out-outline',
  mail: 'mail-outline',
  'map-pin': 'location-outline',
  'message-circle': 'chatbubble-outline',
  'more-vertical': 'ellipsis-vertical',
  phone: 'call-outline',
  refresh: 'refresh-outline',
  search: 'search-outline',
  send: 'send',
  settings: 'settings-outline',
  share: 'share-social-outline',
  shield: 'shield-checkmark-outline',
  sliders: 'options-outline',
  star: 'star',
  'star-outline': 'star-outline',
  trash: 'trash-outline',
  'trending-up': 'trending-up-outline',
  upload: 'cloud-upload-outline',
  users: 'people-outline',
  x: 'close',
};

interface Props {
  name: NomeIcone;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color }: Props) {
  return <Ionicons name={MAPA[name]} size={size} color={color} />;
}
