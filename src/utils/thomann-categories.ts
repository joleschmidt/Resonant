/**
 * Thomann Category System (1:1 from thomann.de)
 * Complete 3-level hierarchy: Parent Category → Category → Subcategory
 * Based on https://www.thomann.de/de/gitarren_baesse.html
 */

// ============================================================================
// PARENT CATEGORIES
// ============================================================================

export const PARENT_CATEGORIES = {
  INSTRUMENTS: 'instruments',
  AMPLIFIERS: 'amplifiers',
  EFFECTS_ACCESSORIES: 'effects_accessories',
} as const;

export type ParentCategory = (typeof PARENT_CATEGORIES)[keyof typeof PARENT_CATEGORIES];

// ============================================================================
// INSTRUMENTS - Main Categories
// ============================================================================

export const INSTRUMENT_CATEGORIES = {
  E_GITARREN: 'e_gitarren',
  KONZERTGITARREN: 'konzertgitarren',
  WESTERNGITARREN: 'westerngitarren',
  E_BAESSE: 'e_baesse',
  AKUSTIKBAESSE: 'akustikbaesse',
  UKULELEN: 'ukulelen',
  BLUEGRASS: 'bluegrass',
  TRAVELGITARREN: 'travelgitarren',
  SONSTIGE_SAITENINSTRUMENTE: 'sonstige_saiteninstrumente',
} as const;

// ============================================================================
// E-GITARREN SUBCATEGORIES
// From https://www.thomann.de/de/e-gitarren.html
// ============================================================================

export const E_GITARREN_SUBCATEGORIES = {
  GITARRENSETS: 'gitarrensets',
  ST_MODELLE: 'st_modelle',
  T_MODELLE: 't_modelle',
  SINGLE_CUT: 'single_cut',
  DOUBLE_CUT: 'double_cut',
  HOLLOWBODY: 'hollowbody',
  HEAVY_GITARREN: 'heavy_gitarren',
  LINKSHAENDER: 'linkshaender_e_gitarren',
  PREMIUM: 'premium_instrumente',
  JAZZ: 'jazz_modelle',
  SIEBEN_SAITER: 'sieben_saiter',
  ACHT_SAITER: 'acht_saiter',
  FANFRET: 'fanfret',
  HEADLESS: 'headless',
  ZWOELF_SAITER: 'zwoelf_saiter',
  BARITONE: 'baritone_modelle',
  SHORTSCALE: 'shortscale',
  MIDI_DIGITAL: 'midi_digital_modeling',
  MIT_AKUSTIK_TONABNEHMER: 'mit_akustik_tonabnehmer',
  SONSTIGE_BAUARTEN: 'sonstige_bauarten',
  SIGNATURE: 'signature_e_gitarren',
} as const;

// ============================================================================
// KONZERTGITARREN SUBCATEGORIES
// ============================================================================

export const KONZERTGITARREN_SUBCATEGORIES = {
  KONZERTGITARRENSETS: 'konzertgitarrensets',
  KONZERTGITARRE_4_4: 'konzertgitarre_4_4',
  KONZERTGITARRE_7_8: 'konzertgitarre_7_8',
  KONZERTGITARRE_3_4: 'konzertgitarre_3_4',
  KONZERTGITARRE_1_2: 'konzertgitarre_1_2',
  KONZERTGITARRE_1_4: 'konzertgitarre_1_4',
  KONZERTGITARRE_1_8: 'konzertgitarre_1_8',
  FLAMENCO_GITARREN: 'flamenco_gitarren',
  LINKSHAENDER_KONZERT: 'linkshaender_konzertgitarren',
  PREMIUM_KONZERT: 'premium_konzertgitarren',
  MIT_TONABNEHMER: 'konzertgitarren_mit_tonabnehmer',
} as const;

// ============================================================================
// WESTERNGITARREN SUBCATEGORIES
// ============================================================================

export const WESTERNGITARREN_SUBCATEGORIES = {
  WESTERNGITARRENSETS: 'westerngitarrensets',
  DREADNOUGHT: 'dreadnought',
  GRAND_AUDITORIUM: 'grand_auditorium',
  JUMBO: 'jumbo',
  PARLOR_FOLK: 'parlor_folk',
  RESONATOR: 'resonator_gitarren',
  ZWOELF_SAITER_WESTERN: 'zwoelf_saiter_western',
  LINKSHAENDER_WESTERN: 'linkshaender_westerngitarren',
  PREMIUM_WESTERN: 'premium_westerngitarren',
  ELEKTRO_AKUSTIK: 'elektro_akustik_gitarren',
  MINI_WESTERN: 'mini_westerngitarren',
} as const;

// ============================================================================
// E-BÄSSE SUBCATEGORIES
// ============================================================================

export const E_BAESSE_SUBCATEGORIES = {
  BASSSETS: 'basssets',
  VIER_SAITER: 'vier_saiter_baesse',
  FUENF_SAITER: 'fuenf_saiter_baesse',
  SECHS_SAITER: 'sechs_saiter_baesse',
  FRETLESS: 'fretless_baesse',
  SHORTSCALE_BASS: 'shortscale_baesse',
  LINKSHAENDER_BASS: 'linkshaender_baesse',
  PREMIUM_BASS: 'premium_baesse',
  SIGNATURE_BASS: 'signature_baesse',
  MULTI_SCALE_BASS: 'multi_scale_baesse',
  HEADLESS_BASS: 'headless_baesse',
} as const;

// ============================================================================
// AKUSTIKBÄSSE SUBCATEGORIES
// ============================================================================

export const AKUSTIKBAESSE_SUBCATEGORIES = {
  AKUSTIKBASS_MIT_TONABNEHMER: 'akustikbass_mit_tonabnehmer',
  AKUSTIKBASS_OHNE_TONABNEHMER: 'akustikbass_ohne_tonabnehmer',
  HALBAKUSTIK_BASS: 'halbakustik_bass',
} as const;

// ============================================================================
// UKULELEN SUBCATEGORIES
// ============================================================================

export const UKULELEN_SUBCATEGORIES = {
  SOPRAN_UKULELE: 'sopran_ukulele',
  KONZERT_UKULELE: 'konzert_ukulele',
  TENOR_UKULELE: 'tenor_ukulele',
  BARITON_UKULELE: 'bariton_ukulele',
  BASS_UKULELE: 'bass_ukulele',
  BANJO_UKULELE: 'banjo_ukulele',
  E_UKULELE: 'elektro_ukulele',
} as const;

// ============================================================================
// BLUEGRASS SUBCATEGORIES
// ============================================================================

export const BLUEGRASS_SUBCATEGORIES = {
  BANJOS: 'banjos',
  MANDOLINEN: 'mandolinen',
  DOBROS: 'dobros',
  IRISH_BOUZOUKI: 'irish_bouzouki',
} as const;

// ============================================================================
// TRAVELGITARREN SUBCATEGORIES
// ============================================================================

export const TRAVELGITARREN_SUBCATEGORIES = {
  TRAVEL_E_GITARREN: 'travel_e_gitarren',
  TRAVEL_AKUSTIK: 'travel_akustikgitarren',
  TRAVEL_KONZERT: 'travel_konzertgitarren',
} as const;

// ============================================================================
// SONSTIGE SAITENINSTRUMENTE
// ============================================================================

export const SONSTIGE_SAITEN_SUBCATEGORIES = {
  LAUTEN: 'lauten',
  SITAR: 'sitar',
  GAMBEN: 'gamben',
  HARFEN: 'harfen',
  SONSTIGE: 'sonstige',
} as const;

// ============================================================================
// AMPLIFIERS - Main Categories
// ============================================================================

export const AMPLIFIER_CATEGORIES = {
  E_GITARREN_VERSTAERKER: 'e_gitarren_verstaerker',
  BASSVERSTAERKER: 'bassverstaerker',
  AKUSTIKGITARREN_VERSTAERKER: 'akustikgitarren_verstaerker',
} as const;

// ============================================================================
// E-GITARREN-VERSTÄRKER SUBCATEGORIES
// ============================================================================

export const E_GITARREN_VERSTAERKER_SUBCATEGORIES = {
  COMBO_AMP: 'combo_verstaerker',
  TOPTEIL: 'topteil_verstaerker',
  BOXEN: 'gitarrenboxen',
  ROEHRENVERSTAERKER: 'roehrenverstaerker',
  TRANSISTORVERSTAERKER: 'transistorverstaerker',
  MODELING_VERSTAERKER: 'modeling_verstaerker',
  MINI_VERSTAERKER: 'mini_verstaerker',
  PREAMP_PEDAL: 'preamp_pedal',
} as const;

// ============================================================================
// BASSVERSTÄRKER SUBCATEGORIES
// ============================================================================

export const BASSVERSTAERKER_SUBCATEGORIES = {
  BASS_COMBO: 'bass_combo',
  BASS_TOPTEIL: 'bass_topteil',
  BASS_BOXEN: 'bass_boxen',
  BASS_PREAMP: 'bass_preamp',
  BASS_MODELING: 'bass_modeling',
} as const;

// ============================================================================
// AKUSTIKGITARREN-VERSTÄRKER SUBCATEGORIES
// ============================================================================

export const AKUSTIK_VERSTAERKER_SUBCATEGORIES = {
  AKUSTIK_COMBO: 'akustik_combo',
  AKUSTIK_PREAMP: 'akustik_preamp',
  SINGER_SONGWRITER_AMP: 'singer_songwriter_amp',
} as const;

// ============================================================================
// EFFECTS & ACCESSORIES - Main Categories
// ============================================================================

export const EFFECTS_ACCESSORIES_CATEGORIES = {
  GITARREN_BASS_EFFEKTE: 'gitarren_bass_effekte',
  PICKUPS: 'pickups_tonabnehmer',
  SAITEN: 'saiten',
  ERSATZTEILE: 'ersatzteile',
  ZUBEHOER: 'zubehoer',
  DRAHTLOSSYSTEME: 'drahtlossysteme',
} as const;

// ============================================================================
// GITARREN- UND BASS-EFFEKTE SUBCATEGORIES
// ============================================================================

export const EFFEKTE_SUBCATEGORIES = {
  MULTIEFFEKTE: 'multieffekte',
  VERZERRER: 'verzerrer',
  OVERDRIVE: 'overdrive',
  DISTORTION: 'distortion',
  FUZZ: 'fuzz',
  BOOST: 'boost',
  DELAY: 'delay',
  REVERB: 'reverb',
  CHORUS: 'chorus',
  FLANGER: 'flanger',
  PHASER: 'phaser',
  TREMOLO: 'tremolo',
  VIBRATO: 'vibrato',
  WAH_WAH: 'wah_wah',
  FILTER: 'filter',
  KOMPRESSOR: 'kompressor',
  EQ: 'eq',
  LOOPER: 'looper',
  PITCH_SHIFTER: 'pitch_shifter',
  HARMONIZER: 'harmonizer',
  OKTAVER: 'oktaver',
  VOLUME_PEDAL: 'volume_pedal',
  NOISE_GATE: 'noise_gate',
  PEDALBOARDS: 'pedalboards',
  NETZTEIL_EFFEKTE: 'netzteil_effekte',
} as const;

// ============================================================================
// PICKUPS SUBCATEGORIES
// ============================================================================

export const PICKUPS_SUBCATEGORIES = {
  E_GITARREN_PICKUPS: 'e_gitarren_pickups',
  BASS_PICKUPS: 'bass_pickups',
  AKUSTIK_TONABNEHMER: 'akustik_tonabnehmer',
  PIEZO_TONABNEHMER: 'piezo_tonabnehmer',
} as const;

// ============================================================================
// SAITEN SUBCATEGORIES
// ============================================================================

export const SAITEN_SUBCATEGORIES = {
  E_GITARREN_SAITEN: 'e_gitarren_saiten',
  WESTERNGITARREN_SAITEN: 'westerngitarren_saiten',
  KONZERTGITARREN_SAITEN: 'konzertgitarren_saiten',
  BASS_SAITEN: 'bass_saiten',
  UKULELE_SAITEN: 'ukulele_saiten',
  BANJO_SAITEN: 'banjo_saiten',
  MANDOLINE_SAITEN: 'mandoline_saiten',
} as const;

// ============================================================================
// ERSATZTEILE SUBCATEGORIES
// ============================================================================

export const ERSATZTEILE_SUBCATEGORIES = {
  MECHANIKEN: 'mechaniken',
  BRUECKEN: 'bruecken',
  SAETTELN: 'saetteln',
  POTIKNOBS: 'potis_schalter_knoepfe',
  KORPUSSE: 'korpusse_bodys',
  HAELSE: 'haelse_necks',
  ELEKTRONIK: 'elektronik',
  HARDWARE: 'hardware',
} as const;

// ============================================================================
// ZUBEHÖR SUBCATEGORIES
// ============================================================================

export const ZUBEHOER_SUBCATEGORIES = {
  KOFFER_GIGBAGS: 'koffer_gigbags',
  GURTE: 'gurte_straps',
  PLEKTREN: 'plektren',
  KAPODASTER: 'kapodaster',
  STIMMGERAETE: 'stimmgeraete',
  SAITENWICKLER: 'saitenwickler',
  STAENDER: 'gitarrenstaender',
  PFLEGEMITTEL: 'pflegemittel',
  KABEL: 'kabel',
  SLIDES: 'slides',
  DAEMPFER: 'daempfer',
} as const;

// ============================================================================
// DRAHTLOSSYSTEME SUBCATEGORIES
// ============================================================================

export const DRAHTLOS_SUBCATEGORIES = {
  DIGITAL_DRAHTLOS: 'digital_drahtlossysteme',
  ANALOG_DRAHTLOS: 'analog_drahtlossysteme',
  MINI_DRAHTLOS: 'mini_drahtlossysteme',
} as const;

// ============================================================================
// COMPLETE CATEGORY TREE TYPE
// ============================================================================

export interface CategoryNode {
  id: string;
  name: string;
  nameDE: string;
  parent?: string;
  subcategories?: readonly string[];
}

// ============================================================================
// CATEGORY TREE - Complete hierarchy with German labels
// ============================================================================

export const THOMANN_CATEGORY_TREE: Record<string, CategoryNode> = {
  // Parent: Instruments
  [INSTRUMENT_CATEGORIES.E_GITARREN]: {
    id: INSTRUMENT_CATEGORIES.E_GITARREN,
    name: 'E-Gitarren',
    nameDE: 'E-Gitarren',
    parent: PARENT_CATEGORIES.INSTRUMENTS,
    subcategories: Object.values(E_GITARREN_SUBCATEGORIES),
  },
  [INSTRUMENT_CATEGORIES.KONZERTGITARREN]: {
    id: INSTRUMENT_CATEGORIES.KONZERTGITARREN,
    name: 'Konzertgitarren',
    nameDE: 'Konzertgitarren',
    parent: PARENT_CATEGORIES.INSTRUMENTS,
    subcategories: Object.values(KONZERTGITARREN_SUBCATEGORIES),
  },
  [INSTRUMENT_CATEGORIES.WESTERNGITARREN]: {
    id: INSTRUMENT_CATEGORIES.WESTERNGITARREN,
    name: 'Westerngitarren',
    nameDE: 'Westerngitarren',
    parent: PARENT_CATEGORIES.INSTRUMENTS,
    subcategories: Object.values(WESTERNGITARREN_SUBCATEGORIES),
  },
  [INSTRUMENT_CATEGORIES.E_BAESSE]: {
    id: INSTRUMENT_CATEGORIES.E_BAESSE,
    name: 'E-Bässe',
    nameDE: 'E-Bässe',
    parent: PARENT_CATEGORIES.INSTRUMENTS,
    subcategories: Object.values(E_BAESSE_SUBCATEGORIES),
  },
  [INSTRUMENT_CATEGORIES.AKUSTIKBAESSE]: {
    id: INSTRUMENT_CATEGORIES.AKUSTIKBAESSE,
    name: 'Akustische und Halbakustische Bässe',
    nameDE: 'Akustische und Halbakustische Bässe',
    parent: PARENT_CATEGORIES.INSTRUMENTS,
    subcategories: Object.values(AKUSTIKBAESSE_SUBCATEGORIES),
  },
  [INSTRUMENT_CATEGORIES.UKULELEN]: {
    id: INSTRUMENT_CATEGORIES.UKULELEN,
    name: 'Ukulelen',
    nameDE: 'Ukulelen',
    parent: PARENT_CATEGORIES.INSTRUMENTS,
    subcategories: Object.values(UKULELEN_SUBCATEGORIES),
  },
  [INSTRUMENT_CATEGORIES.BLUEGRASS]: {
    id: INSTRUMENT_CATEGORIES.BLUEGRASS,
    name: 'Bluegrass Instrumente',
    nameDE: 'Bluegrass Instrumente',
    parent: PARENT_CATEGORIES.INSTRUMENTS,
    subcategories: Object.values(BLUEGRASS_SUBCATEGORIES),
  },
  [INSTRUMENT_CATEGORIES.TRAVELGITARREN]: {
    id: INSTRUMENT_CATEGORIES.TRAVELGITARREN,
    name: 'Travelgitarren',
    nameDE: 'Travelgitarren',
    parent: PARENT_CATEGORIES.INSTRUMENTS,
    subcategories: Object.values(TRAVELGITARREN_SUBCATEGORIES),
  },
  [INSTRUMENT_CATEGORIES.SONSTIGE_SAITENINSTRUMENTE]: {
    id: INSTRUMENT_CATEGORIES.SONSTIGE_SAITENINSTRUMENTE,
    name: 'Sonstige Saiteninstrumente',
    nameDE: 'Sonstige Saiteninstrumente',
    parent: PARENT_CATEGORIES.INSTRUMENTS,
    subcategories: Object.values(SONSTIGE_SAITEN_SUBCATEGORIES),
  },
  // Parent: Amplifiers
  [AMPLIFIER_CATEGORIES.E_GITARREN_VERSTAERKER]: {
    id: AMPLIFIER_CATEGORIES.E_GITARREN_VERSTAERKER,
    name: 'E-Gitarren-Verstärker',
    nameDE: 'E-Gitarren-Verstärker',
    parent: PARENT_CATEGORIES.AMPLIFIERS,
    subcategories: Object.values(E_GITARREN_VERSTAERKER_SUBCATEGORIES),
  },
  [AMPLIFIER_CATEGORIES.BASSVERSTAERKER]: {
    id: AMPLIFIER_CATEGORIES.BASSVERSTAERKER,
    name: 'Bassverstärker',
    nameDE: 'Bassverstärker',
    parent: PARENT_CATEGORIES.AMPLIFIERS,
    subcategories: Object.values(BASSVERSTAERKER_SUBCATEGORIES),
  },
  [AMPLIFIER_CATEGORIES.AKUSTIKGITARREN_VERSTAERKER]: {
    id: AMPLIFIER_CATEGORIES.AKUSTIKGITARREN_VERSTAERKER,
    name: 'Akustikgitarren-Verstärker',
    nameDE: 'Akustikgitarren-Verstärker',
    parent: PARENT_CATEGORIES.AMPLIFIERS,
    subcategories: Object.values(AKUSTIK_VERSTAERKER_SUBCATEGORIES),
  },
  // Parent: Effects & Accessories
  [EFFECTS_ACCESSORIES_CATEGORIES.GITARREN_BASS_EFFEKTE]: {
    id: EFFECTS_ACCESSORIES_CATEGORIES.GITARREN_BASS_EFFEKTE,
    name: 'Gitarren- und Bass-Effekte',
    nameDE: 'Gitarren- und Bass-Effekte',
    parent: PARENT_CATEGORIES.EFFECTS_ACCESSORIES,
    subcategories: Object.values(EFFEKTE_SUBCATEGORIES),
  },
  [EFFECTS_ACCESSORIES_CATEGORIES.PICKUPS]: {
    id: EFFECTS_ACCESSORIES_CATEGORIES.PICKUPS,
    name: 'Pickups und Tonabnehmer',
    nameDE: 'Pickups und Tonabnehmer',
    parent: PARENT_CATEGORIES.EFFECTS_ACCESSORIES,
    subcategories: Object.values(PICKUPS_SUBCATEGORIES),
  },
  [EFFECTS_ACCESSORIES_CATEGORIES.SAITEN]: {
    id: EFFECTS_ACCESSORIES_CATEGORIES.SAITEN,
    name: 'Saiten',
    nameDE: 'Saiten',
    parent: PARENT_CATEGORIES.EFFECTS_ACCESSORIES,
    subcategories: Object.values(SAITEN_SUBCATEGORIES),
  },
  [EFFECTS_ACCESSORIES_CATEGORIES.ERSATZTEILE]: {
    id: EFFECTS_ACCESSORIES_CATEGORIES.ERSATZTEILE,
    name: 'Ersatzteile für Instrumente',
    nameDE: 'Ersatzteile für Instrumente',
    parent: PARENT_CATEGORIES.EFFECTS_ACCESSORIES,
    subcategories: Object.values(ERSATZTEILE_SUBCATEGORIES),
  },
  [EFFECTS_ACCESSORIES_CATEGORIES.ZUBEHOER]: {
    id: EFFECTS_ACCESSORIES_CATEGORIES.ZUBEHOER,
    name: 'Zubehör für Gitarren und Bässe',
    nameDE: 'Zubehör für Gitarren und Bässe',
    parent: PARENT_CATEGORIES.EFFECTS_ACCESSORIES,
    subcategories: Object.values(ZUBEHOER_SUBCATEGORIES),
  },
  [EFFECTS_ACCESSORIES_CATEGORIES.DRAHTLOSSYSTEME]: {
    id: EFFECTS_ACCESSORIES_CATEGORIES.DRAHTLOSSYSTEME,
    name: 'Gitarren-/Bass-Drahtlossysteme',
    nameDE: 'Gitarren-/Bass-Drahtlossysteme',
    parent: PARENT_CATEGORIES.EFFECTS_ACCESSORIES,
    subcategories: Object.values(DRAHTLOS_SUBCATEGORIES),
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCategoryName(categoryId: string): string {
  return THOMANN_CATEGORY_TREE[categoryId]?.nameDE || categoryId;
}

export function getSubcategories(categoryId: string): readonly string[] {
  return THOMANN_CATEGORY_TREE[categoryId]?.subcategories || [];
}

export function getAllCategories(): string[] {
  return Object.keys(THOMANN_CATEGORY_TREE);
}

export function getCategoriesByParent(parentId: string): CategoryNode[] {
  return Object.values(THOMANN_CATEGORY_TREE).filter(cat => cat.parent === parentId);
}
