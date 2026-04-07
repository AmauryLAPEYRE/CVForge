export interface ColorOption {
  hex: string;
  label: string;
  bg?: string; // Optional background color (for full-bg templates like Atlantic)
}

export interface StyleDirection {
  name: string;
  tag: string;
  description: string;
  defaultColor: string;
  defaultLayout: "single" | "double" | "sidebar";
  templateFile: string;
  colors: ColorOption[];
}

export const STYLE_DIRECTIONS: StyleDirection[] = [
  {
    name: "Obsidian",
    tag: "dark",
    description: "Design sombre premium avec sidebar. Fond anthracite profond, texte clair, accent dore/cuivre. Sidebar gauche sombre avec competences en tags. Zone principale claire.",
    defaultColor: "#c8875f",
    defaultLayout: "sidebar",
    templateFile: "obsidian.html",
    colors: [
      { hex: "#c8875f", label: "Cuivre" },
      { hex: "#c9a55a", label: "Or" },
      { hex: "#8a9a9e", label: "Argent" },
      { hex: "#7a3b3b", label: "Bordeaux" },
      { hex: "#4a6670", label: "Petrole" },
      { hex: "#6b5b4a", label: "Bronze" },
    ],
  },
  {
    name: "Mineral",
    tag: "warm",
    description: "Terre et pierre. Sidebar chocolat profond avec accent terracotta/cuivre. Fond creme chaud. Typo Fraunces serif. Barres de competences en gradient.",
    defaultColor: "#c17f4e",
    defaultLayout: "sidebar",
    templateFile: "mineral.html",
    colors: [
      { hex: "#c17f4e", label: "Terracotta" },
      { hex: "#8b6d45", label: "Cognac" },
      { hex: "#6b5040", label: "Cacao" },
      { hex: "#7a6a4f", label: "Olive" },
      { hex: "#8b4f5e", label: "Prune" },
      { hex: "#5a7a5e", label: "Sauge" },
    ],
  },
  {
    name: "Atlantic",
    tag: "ocean",
    description: "Deep ocean. Fond bleu nuit pleine page avec gradient. Accents dores comme du sable. Cartes glass pour les experiences. Bulles decoratives.",
    defaultColor: "#d4a857",
    defaultLayout: "double",
    templateFile: "atlantic.html",
    colors: [
      { hex: "#d4a857", bg: "#0a1628", label: "Ocean & Or" },
      { hex: "#c9a0dc", bg: "#1a0e28", label: "Nuit & Lilas" },
      { hex: "#e8a87c", bg: "#1e1008", label: "Ebene & Cuivre" },
      { hex: "#7ec8a4", bg: "#081e18", label: "Abysses & Jade" },
      { hex: "#a0b8d0", bg: "#0e1520", label: "Acier & Glace" },
      { hex: "#d4836b", bg: "#200e0a", label: "Braise & Corail" },
    ],
  },
  {
    name: "Zenith",
    tag: "bold",
    description: "Bauhaus vivant. Barre rouge signature en haut. Sidebar noire a droite avec barres rouges. Instrument Serif + IBM Plex Mono. Prefixes // rouge sur les titres.",
    defaultColor: "#c23616",
    defaultLayout: "sidebar",
    templateFile: "zenith.html",
    colors: [
      { hex: "#c23616", label: "Vermillon" },
      { hex: "#1a3a5c", label: "Marine" },
      { hex: "#2d2d2d", label: "Carbone" },
      { hex: "#d35400", label: "Feu" },
      { hex: "#1a5c3a", label: "Foret" },
      { hex: "#5c1a3a", label: "Grenat" },
    ],
  },
  {
    name: "Magma",
    tag: "impact",
    description: "Magazine cover. Hero rouge pleine largeur avec nom geant. Bande noire profil. Corps en grille 3 colonnes. Skills en tags roses. Timeline a dots.",
    defaultColor: "#d63031",
    defaultLayout: "single",
    templateFile: "magma.html",
    colors: [
      { hex: "#d63031", label: "Magma" },
      { hex: "#e17055", label: "Corail" },
      { hex: "#0984e3", label: "Electrique" },
      { hex: "#6c5ce7", label: "Indigo" },
      { hex: "#00b894", label: "Menthe" },
      { hex: "#2d3436", label: "Onyx" },
    ],
  },
  {
    name: "Kaleo",
    tag: "arch",
    description: "Blueprint architectural. Grille visible en arriere-plan. Marques de marge dans les coins. Contact en card accent. Experiences en cartes blanches bordure gauche. Skills en chips cerclees.",
    defaultColor: "#2d6a4f",
    defaultLayout: "single",
    templateFile: "kaleo.html",
    colors: [
      { hex: "#2d6a4f", label: "Foret" },
      { hex: "#3a506b", label: "Ardoise" },
      { hex: "#6b4c3b", label: "Brique" },
      { hex: "#5c4b8a", label: "Encre" },
      { hex: "#8a6b3a", label: "Miel" },
      { hex: "#3a3a3a", label: "Graphite" },
    ],
  },
  {
    name: "Nord",
    tag: "poster",
    description: "Scandinavian poster. Nom geant 88px pleine largeur. Grille de cartes blanches sur fond lin. Profil en 2 colonnes serif. Losanges comme bullets. Langues en badges pills.",
    defaultColor: "#5a6c57",
    defaultLayout: "single",
    templateFile: "nord.html",
    colors: [
      { hex: "#5a6c57", label: "Lichen" },
      { hex: "#6b5b4a", label: "Bois" },
      { hex: "#4a5c6b", label: "Fjord" },
      { hex: "#8a7060", label: "Sable" },
      { hex: "#5a4a3a", label: "Tourbe" },
      { hex: "#7a6a5a", label: "Pierre" },
    ],
  },
  {
    name: "Soma",
    tag: "luxe",
    description: "Tokyo luxe dark mode. Nom vertical sur bande laterale etroite. Fond noir profond avec grain texture. Accent dore/champagne. Skills en cartes glass. Tirets comme bullets.",
    defaultColor: "#b8956a",
    defaultLayout: "sidebar",
    templateFile: "soma.html",
    colors: [
      { hex: "#b8956a", bg: "#0c0c0e", label: "Nuit & Champagne" },
      { hex: "#8a8a8e", bg: "#0e0e10", label: "Onyx & Argent" },
      { hex: "#c4836b", bg: "#10080a", label: "Noir & Rose Gold" },
      { hex: "#6a9a8a", bg: "#080e0c", label: "Foret & Jade" },
      { hex: "#9a7a6a", bg: "#0e0c08", label: "Nuit & Santal" },
      { hex: "#7a6a8a", bg: "#0c0a0e", label: "Encre & Wisteria" },
    ],
  },
  {
    name: "Aura",
    tag: "art",
    description: "Galerie d'art contemporain. Grand cercle accent en arriere-plan. Cadre fin interieur. Nom fantome en diagonale. Contact en bulle flottante. Layout en Z. Skills en pips rectangulaires.",
    defaultColor: "#6b4c8a",
    defaultLayout: "single",
    templateFile: "aura.html",
    colors: [
      { hex: "#6b4c8a", label: "Amethyste" },
      { hex: "#4a6b8a", label: "Saphir" },
      { hex: "#8a4c5a", label: "Rubis" },
      { hex: "#3a6a5a", label: "Emeraude" },
      { hex: "#8a7a4a", label: "Topaze" },
      { hex: "#5a5a6a", label: "Titane" },
    ],
  },
  {
    name: "Velvet",
    tag: "ecrin",
    description: "Ecrin de luxe dark mode. Double cadre dore avec ornements de coin. Nom centre en serif grave. Diamant decoratif. Deux panneaux symetriques comme un livre ouvert. Spine doree centrale.",
    defaultColor: "#a08050",
    defaultLayout: "double",
    templateFile: "velvet.html",
    colors: [
      { hex: "#a08050", bg: "#18171a", label: "Ecrin & Or" },
      { hex: "#9a9a9e", bg: "#161618", label: "Velours & Platine" },
      { hex: "#b07a6a", bg: "#1a1516", label: "Nuit & Rose Gold" },
      { hex: "#7a6a5a", bg: "#16140e", label: "Ebene & Bronze" },
      { hex: "#6a7a7a", bg: "#141618", label: "Abysses & Etain" },
      { hex: "#8a6050", bg: "#181210", label: "Ambre & Cuivre" },
    ],
  },
  {
    name: "Fresco",
    tag: "renaissance",
    description: "Renaissance painting. Fond parchemin avec texture grain. Double cadre dore avec ornements floraux. Lettrine enluminee. Bullets hedera. Spine ornementale entre colonnes.",
    defaultColor: "#8b6914",
    defaultLayout: "double",
    templateFile: "fresco.html",
    colors: [
      { hex: "#7a5a1e", bg: "#3a2e1e", label: "Parchemin & Or" },
      { hex: "#6b4423", bg: "#2e1e18", label: "Terre & Sienne" },
      { hex: "#4a6a3a", bg: "#1e2e18", label: "Foret & Mousse" },
      { hex: "#5a3a4a", bg: "#2e1820", label: "Vin & Prune" },
      { hex: "#3a4a5a", bg: "#182028", label: "Ciel & Acier" },
      { hex: "#6a5040", bg: "#281e14", label: "Cuir & Tabac" },
    ],
  },
];
