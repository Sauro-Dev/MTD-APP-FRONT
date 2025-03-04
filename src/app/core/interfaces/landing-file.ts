export interface LandingFile {
  idLandingFiles: number;
  fileTypes: string;
  fileName: string;
  fileSector: 'NEWS' | 'MAGAZINE' | 'BANNER' | 'FEATURED_MAKER' | 'HISTORY' ;
  adminId?: number;
  displayName?: string;
  makerName?: string;
  description?: string;
}
