
import { Client, ModuleType } from './types';

export const AVAILABLE_CLIENTS: Client[] = [
  {
    id: 'xp',
    name: 'XP',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/XP-LA_Logo.png',
    colors: {
      primary: '#0072E5', // Main brand blue
      primaryDark: '#003366', // Darker shade
      primaryLight: '#5DA9E8', // Lightened blue
      primaryExtraLight: '#D6E8F9', // Very light blue
      textOnPrimary: '#FFFFFF', // White text on primary blue
      textOnPrimaryLight: '#003366', // Dark blue text for light blue backgrounds
      textOnPrimaryExtraLight: '#005EA4', // Medium-dark blue for extra light backgrounds
      bodyText: '#003366', // Dark blue for main text
      baseBrandColor: '#0072E5', // User-provided base
      highlightText: '#0072E5', // Primary blue for highlights
      readableTextOverride: '#1A202C', // Dark gray for general text
    }
  },
  {
    id: 'cruz-verde',
    name: 'Cruz Verde',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Logotipo_Cruz_Verde.svg/1468px-Logotipo_Cruz_Verde.svg.png',
    colors: {
      primary: '#009248', // Main brand green
      primaryDark: '#006A34', // Darker green
      primaryLight: '#3EAE74', // Lightened green
      primaryExtraLight: '#D9F0E5', // Very light green
      textOnPrimary: '#FFFFFF', // White text on primary green
      textOnPrimaryLight: '#006A34', // Dark green text for light green backgrounds
      textOnPrimaryExtraLight: '#007F3E', // Medium-dark green for extra light backgrounds
      bodyText: '#006A34', // Dark green for main text
      baseBrandColor: '#009248', // User-provided base
      highlightText: '#009248', // Primary green for highlights
      readableTextOverride: '#1A202C', // Dark gray for general text
    }
  },
  { 
    id: 'walmart', 
    name: 'Walmart', 
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Walmart_Chile_Logo_2.svg/1595px-Walmart_Chile_Logo_2.svg.png',
    colors: {
      primary: '#0071CE', primaryDark: '#0058A3', primaryLight: '#60A5FA', primaryExtraLight: '#EFF6FF', 
      textOnPrimary: '#FFFFFF', textOnPrimaryLight: '#1E3A8A', textOnPrimaryExtraLight: '#0058A3',
      bodyText: '#1E40AF', baseBrandColor: '#0072E5', highlightText: '#3391EB', readableTextOverride: '#333333',
    }
  },
  { 
    id: 'ripley', 
    name: 'Ripley', 
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Ripley_Logo.png/1200px-Ripley_Logo.png',
    colors: {
      primary: '#FF0099', primaryDark: '#CC007A', primaryLight: '#FF66C2', primaryExtraLight: '#FFE6F5',
      textOnPrimary: '#FFFFFF', textOnPrimaryLight: '#4D0030', textOnPrimaryExtraLight: '#CC007A',
      bodyText: '#B3006B', baseBrandColor: '#FF0099', highlightText: '#FF33AD', readableTextOverride: '#333333',
    }
  },
  { 
    id: 'banco-ripley', 
    name: 'Banco Ripley', 
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Logo_Ripley_banco_2.png',
    colors: { 
      primary: '#5F36C4', primaryDark: '#4C2B9D', primaryLight: '#9D79E1', primaryExtraLight: '#EDE7F9',
      textOnPrimary: '#FFFFFF', textOnPrimaryLight: '#26154F', textOnPrimaryExtraLight: '#4C2B9D',
      bodyText: '#3E2480', baseBrandColor: '#5F36C4', highlightText: '#7F5CD1', readableTextOverride: '#333333',
    }
  },
  { 
    id: 'parque-del-recuerdo', 
    name: 'Parque del Recuerdo', 
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Logo-Parque-del-Recuerdo.png', 
    colors: {
      primary: '#006A4E', primaryDark: '#005840', primaryLight: '#34D399', primaryExtraLight: '#D1FAE5',
      textOnPrimary: '#FFFFFF', textOnPrimaryLight: '#064E3B', textOnPrimaryExtraLight: '#005840',
      bodyText: '#047857', baseBrandColor: '#317058', highlightText: '#4A8A71', readableTextOverride: '#333333',
    } 
  },
  { 
    id: 'metlife', 
    name: 'Metlife', 
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/MetLife_logo.svg/2560px-MetLife_logo.svg.png', 
    colors: {
      primary: '#007ABC', primaryDark: '#00629A', primaryLight: '#38BDF8', primaryExtraLight: '#E0F2FE',
      textOnPrimary: '#FFFFFF', textOnPrimaryLight: '#0C4A6E', textOnPrimaryExtraLight: '#00629A',
      bodyText: '#0369A1', baseBrandColor: '#007ABC', highlightText: '#3398C9', readableTextOverride: '#333333',
    } 
  },
];

let nextIdVal = 0;
export const generateUniqueId = (prefix: string = 'id'): string => {
  nextIdVal++;
  return `${prefix}-${Date.now()}-${nextIdVal}`;
};

export const getModuleName = (moduleType: ModuleType): string => {
  const names: Record<ModuleType, string> = {
    [ModuleType.INFO_GRID]: 'Cuadrícula de Información',
    [ModuleType.PARTICIPATION]: 'Participación y Asistencia',
    [ModuleType.JORNADA_FORMATIVA]: 'Desarrollo de la Jornada',
    [ModuleType.ASPECTOS_CLAVE]: 'Aspectos Clave / Destacados',
    [ModuleType.DESAFIOS_OPORTUNIDADES]: 'Desafíos y Oportunidades',
    [ModuleType.CIERRE_CONCLUSION]: 'Cierre y Conclusiones',
    [ModuleType.EVIDENCIA_VISUAL]: 'Evidencia Visual',
    [ModuleType.RICH_TEXT]: 'Texto Enriquecido',
    [ModuleType.BULLET_LIST]: 'Lista de Viñetas',
  };
  return names[moduleType] || 'Módulo Desconocido';
};

export const getModuleIconName = (moduleType: ModuleType): string | undefined => {
  const icons: Partial<Record<ModuleType, string>> = {
    [ModuleType.INFO_GRID]: 'grid_view',
    [ModuleType.PARTICIPATION]: 'groups',
    [ModuleType.JORNADA_FORMATIVA]: 'dynamic_feed',
    [ModuleType.ASPECTOS_CLAVE]: 'star_rate',
    [ModuleType.DESAFIOS_OPORTUNIDADES]: 'trending_up',
    [ModuleType.CIERRE_CONCLUSION]: 'speaker_notes',
    [ModuleType.EVIDENCIA_VISUAL]: 'photo_camera',
    [ModuleType.RICH_TEXT]: 'article',
    [ModuleType.BULLET_LIST]: 'format_list_bulleted',
  };
  return icons[moduleType];
};

export const MATERIAL_ICONS: string[] = [
  "search", "home", "menu", "close", "settings", "done", "expand_more", "check_circle",
  "favorite", "add", "delete", "edit", "arrow_back", "arrow_forward", "star",
  "logout", "notifications", "person", "place", "refresh", "visibility", "visibility_off",
  "info", "warning", "error", "help_outline", "history", "lightbulb", "schedule",
  "event", "description", "folder", "file_download", "file_upload", "print", "send",
  "email", "phone", "link", "share", "thumb_up", "thumb_down", "shopping_cart",
  "payment", "account_circle", "language", "store", "badge", "groups", "group_add", "grid_view",
  "how_to_reg", "dynamic_feed", "star_rate", "trending_up", "speaker_notes", "photo_camera", "article", "format_list_bulleted",
  "add_a_photo", "image", "music_note", "videocam", "book", "code", "brush", "broken_image",
  "build", "dashboard", "assessment", "bar_chart", "pie_chart", "show_chart", "timeline",
  "explore", "room", "map", "directions_car", "train", "flight", "restaurant", "hotel",
  "local_bar", "local_cafe", "fitness_center", "school", "work", "cloud", "cloud_upload",
  "cloud_download", "security", "lock", "lock_open", "fingerprint", "credit_card",
  "attach_money", "euro_symbol", "analytics", "api", "archive", "arrow_drop_down",
  "arrow_drop_up", "arrow_left", "arrow_right", "backup", "block", "bug_report",
  "calendar_today", "call", "camera_alt", "cancel", "chat", "check", "chevron_left",
  "chevron_right", "computer", "content_copy", "content_cut", "content_paste",
  "create", "credit_score", "dataset", "dehaze", "dns", "drag_handle", "eco",
  "engineering", "extension", "face", "filter_alt", "flag", "font_download", "grade",
  "group", "highlight", "hourglass_empty", "https_request", "important_devices",
  "insights", "label", "leaderboard", "list", "login", "mail", "maximize", "minimize",
  "more_horiz", "more_vert", "open_in_browser", "open_in_full", "palette", "pets",
  "push_pin", "receipt_long", "remove", "save", "science", "sort", "spellcheck",
  "square_foot", "support_agent", "sync", "terminal", "translate", "undo", "redo",
  "update", "verified", "wifi", "workspaces", "zoom_in", "zoom_out", "apps",
  "view_list", "view_module", "table_chart", "toggle_on", "toggle_off",
  "task_alt", "radio_button_checked", "radio_button_unchecked", "check_box", "check_box_outline_blank",
  "construction", "query_builder", "published_with_changes", "unpublished", "bolt", "compress",
  "expand", "filter_list", "functions", "height", "merge_type", "pivot_table_chart",
  "stacked_line_chart", "subdirectory_arrow_left", "subdirectory_arrow_right", "toc",
  "vertical_align_bottom", "vertical_align_center", "vertical_align_top", "view_column",
  "view_stream", "work_outline", "account_balance", "admin_panel_settings",
  "agriculture", "anchor", "announcement", "architecture", "assignment", "attractions",
  "bakery_dining", "biotech", "blender", "brunch_dining", "build_circle", "cake",
  "campaign", "carpenter", "celebration", "cleaning_services", "colorize", "comment",
  "compost", "contact_mail", "contact_phone", "cottage", "deck", "delivery_dining",
  "design_services", "developer_mode", "diamond", "dinner_dining", "draw", "edit_calendar",
  "edit_location", "edit_note", "electrical_services", "emoji_events", "emoji_food_beverage",
  "emoji_nature", "emoji_objects", "emoji_people", "emoji_symbols", "emoji_transportation",
  "fact_check", "fastfood", "festival", "fireplace", "flight_takeoff", "format_paint",
  "fort", "free_breakfast", "gavel", "generating_tokens", "grass", "hail", "handyman",
  "hardware", "health_and_safety", "history_edu", "home_repair_service", "icecream",
  "integration_instructions", "interests", "kebab_dining", "laptop_mac", "layers",
  "liquor", "local_activity", "local_atm", "local_convenience_store", "local_drink",
  "local_fire_department", "local_florist", "local_gas_station", "local_grocery_store",
  "local_hospital", "local_laundry_service", "local_library", "local_mall", "local_movies",
  "local_offer", "local_parking", "local_pharmacy", "local_pizza", "local_police",
  "local_post_office", "local_printshop", "local_see", "local_shipping", "local_taxi",
  "lunch_dining", "medical_services", "military_tech", "museum", "nightlife", "no_food",
  "park", "pedal_bike", "pending_actions", "people", "pest_control", "psychology",
  "public", "ramen_dining", "receipt", "recommend", "recycling", "reduce_capacity",
  "report", "restaurant_menu", "reviews", "rule", "sailing", "savings", "shield",
  "shopping_bag", "smoke_free", "soap", "social_distance", "sports_bar", "sports_baseball",
  "sports_basketball", "sports_cricket", "sports_esports", "sports_football", "sports_golf",
  "sports_handball", "sports_hockey", "sports_kabaddi", "sports_mma", "sports_motorsports",
  "sports_soccer", "sports_tennis", "sports_volleyball", "storefront", "stroller",
  "subway", "support", "surfing", "sync_alt", "theater_comedy", "thumb_up_alt",
  "tour", "traffic", "volunteer_activism", "warehouse", "water_drop", "web", "widgets",
  "delete_outline", "add_circle_outline", "picture_as_pdf" 
];