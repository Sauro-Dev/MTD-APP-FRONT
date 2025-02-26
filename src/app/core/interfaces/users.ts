export interface ListUser {
  userId: number;
  username: string;
  role: string;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  email: string;
  age: number;
  birthdate: Date;
  phoneNumber: string;
  codeNumber: string;
  country: string;
  region: string;
  motivation: string;
  estimatedHours: string;
}

export interface MyProfile {
  username: string;
  role: string;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  email: string;
  age: number;
  birthdate: string;
  phoneNumber: string;
  codeNumber: string;
  country: string;
  region: string;
  motivation: string;
  estimatedHours: string;
}

export interface UpdateProfile {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  email: string;
  birthdate: string;
  phoneNumber: string;
  codeNumber: string;
  country: string;
  region: string;
  motivation: string;
  estimatedHours: string;
}

export interface UpdateProfileResponse {
  updatedProfile: UpdateProfile;
  newToken?: string;
}

export interface UserDetails {
  userId: number;
  username: string;
  role: string;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  email: string;
  age: number;
  birthdate: string;
  phoneNumber: string;
  codeNumber: string;
  country: string;
  region: string;
  motivation: string;
  estimatedHours: string;
}
