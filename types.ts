// Defines the core data structures for the application, following a module-based page content approach.

export interface Client { // Renamed from ClientOption for consistency with example
  id: string;
  name: string;
  logoUrl: string;
  colors: ClientColors;
}

export interface ClientColors {
  primary: string;        
  primaryDark: string;    
  primaryLight: string;   
  primaryExtraLight: string; 
  textOnPrimary: string;
  textOnPrimaryLight: string;
  textOnPrimaryExtraLight: string;
  bodyText: string; 
  baseBrandColor: string; 
  highlightText: string;  
  readableTextOverride: string; 
}

// --- MODULE TYPES ---
export enum ModuleType {
  INFO_GRID = 'INFO_GRID',
  PARTICIPATION = 'PARTICIPATION',
  JORNADA_FORMATIVA = 'JORNADA_FORMATIVA',
  ASPECTOS_CLAVE = 'ASPECTOS_CLAVE',
  DESAFIOS_OPORTUNIDADES = 'DESAFIOS_OPORTUNIDADES',
  CIERRE_CONCLUSION = 'CIERRE_CONCLUSION',
  EVIDENCIA_VISUAL = 'EVIDENCIA_VISUAL',
  RICH_TEXT = 'RICH_TEXT',
  BULLET_LIST = 'BULLET_LIST',
}

// --- MODULE DATA INTERFACES ---
export interface InfoGridItem {
  id: string;
  iconName: string;
  labelHTML: string;
  value: string;
}
export interface InfoGridModuleData {
  items: InfoGridItem[];
}

export interface ParticipationStatItem {
  id: string;
  iconName: string;
  labelText: string;
  value: string;
}

export interface ParticipationGroupItem {
  id: string;
  groupTitle?: string; // Optional title for the group, e.g., "Grupo 1", "Turno Mañana"
  stats: ParticipationStatItem[]; // Metrics specific to this group
  groupSummary?: string; // Optional summary text for this specific group
}

export interface ParticipationModuleData {
  groups: ParticipationGroupItem[]; // Array of participant groups
  overallModuleSummary?: string; // Optional summary for the entire participation module, after all groups
}


export interface JornadaItem {
  id: string;
  itemLabelHTML?: string; // Optional label part, e.g., "Observación:"
  description: string;   // Main text of the point
}
export interface JornadaFormativaModuleData {
  introduction: string;
  items: JornadaItem[];
}

export interface AspectosClaveItem {
  id: string;
  itemLabelHTML: string;
  description: string;
}
export interface AspectosClaveModuleData {
  items: AspectosClaveItem[];
}

export interface DesafiosOportunidadesItem {
  id: string;
  itemLabelHTML: string;
  description: string;
}
export interface DesafiosOportunidadesModuleData {
  items: DesafiosOportunidadesItem[];
}

export interface CierreConclusionModuleData {
  text: string;
}

export interface ImageItem {
  id: string;
  file?: File;
  previewUrl?: string;
}
export interface EvidenciaVisualModuleData {
  introText: string;
  images: ImageItem[];
}

export interface RichTextModuleData {
  contentHTML: string;
}

export interface BulletListItem {
    id: string;
    itemLabelHTML?: string; // Optional label part, e.g., "Título del Ítem:" - should be bolded by Gemini
    description: string;    // Main text of the bullet point
}
export interface BulletListModuleData {
    listItems: BulletListItem[];
}


// Maps module types to their specific data structures
export interface ModuleDataMap {
  [ModuleType.INFO_GRID]: InfoGridModuleData;
  [ModuleType.PARTICIPATION]: ParticipationModuleData;
  [ModuleType.JORNADA_FORMATIVA]: JornadaFormativaModuleData;
  [ModuleType.ASPECTOS_CLAVE]: AspectosClaveModuleData;
  [ModuleType.DESAFIOS_OPORTUNIDADES]: DesafiosOportunidadesModuleData;
  [ModuleType.CIERRE_CONCLUSION]: CierreConclusionModuleData;
  [ModuleType.EVIDENCIA_VISUAL]: EvidenciaVisualModuleData;
  [ModuleType.RICH_TEXT]: RichTextModuleData;
  [ModuleType.BULLET_LIST]: BulletListModuleData;
}

// --- MODULE INTERFACE ---
export interface Module<T extends ModuleType = ModuleType> {
  id: string;
  type: T;
  sectionHeaderHTML: string;
  data: ModuleDataMap[T];
}

// --- PAGE DATA ---
export interface ReportPageData {
  id: string;
  reportTitle: string;
  clientLogoUrl: string;
  modules: Module[];
}

// --- UI INTERACTION STATES ---
export interface IconPickerTarget {
  pageIndex: number;
  path: string; // e.g., "modules.0.data.items.1.iconName" or "modules.0.data.groups.0.stats.1.iconName"
}