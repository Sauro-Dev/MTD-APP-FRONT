export interface LandingFile {
  idLandingFiles: number;
  fileTypes: string;
  fileName: string;
  fileSector: 'NEWS' | 'MAGAZINE' | 'BANNER';
  adminId?: number;
  displayName?: string;
}
