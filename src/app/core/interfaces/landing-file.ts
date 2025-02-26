export interface LandingFile {
  idLandingFiles: number;
  fileTypes: string;
  fileName: string;
  fileSector: 'NEWS' | 'MAGAZINE';
  adminId?: number;
  displayName?: string; // propiedad opcional agregada
}
