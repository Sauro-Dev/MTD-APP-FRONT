export interface LandingFile {
  idLandingFiles: number;
  fileTypes: string;
  fileName: string;
  fileSector: 'NEWS' | 'MAGAZINE' | 'BANNER' | 'FEATURED_MAKER' | 'HISTORY' | 'TEAM';
  adminId?: number;
  displayName?: string;
  makerName?: string;
  description?: string;
}
