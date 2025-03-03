export interface VolunteerPending {
  userId: number;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
  dni: string;
  phoneNumber: string;
  codeNumber: string;
  birthdate: string;
  areaId: number | string;
  areaName : string;
  estimatedHours: string;
  motivation: string;
  status: string;
  submissionDate: string;
}

export enum VolunteerStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ApiResponse {
  message: string;
}
