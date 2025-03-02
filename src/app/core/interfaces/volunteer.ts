export interface VolunteerPending {
  userId: number;
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
  estimatedHours: string; // Asegúrate de que está definido aquí
  areaId: string;
}
