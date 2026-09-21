import * as Location from 'expo-location';

export interface LocalizacaoAtual {
  latitude: number;
  longitude: number;
}

export async function obterLocalizacaoAtual(): Promise<LocalizacaoAtual> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error(
      'Permissão de localização negada. Ative a localização nas configurações do celular.'
    );
  }

  const localizacao = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: localizacao.coords.latitude,
    longitude: localizacao.coords.longitude,
  };
}