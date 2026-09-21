export type Screen =
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

export type Profile = 'PASSAGEIRO' | 'MOTORISTA' | 'AMBOS';

export type User = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  perfil: Profile;
  emailValidado: boolean;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  usuario: User;
};

export type RegisterResponse = {
  message: string;
  usuario: User;
};

export type Car = {
  model: string;
  plate: string;
  capacity: number;
};
