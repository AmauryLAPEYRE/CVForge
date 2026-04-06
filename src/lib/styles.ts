export interface StyleDirection {
  name: string;
  tag: string;
  description: string;
  defaultColor: string;
  defaultLayout: "single" | "double" | "sidebar";
}

export const STYLE_DIRECTIONS: StyleDirection[] = [
  {
    name: "Obsidian",
    tag: "dark",
    description:
      "Design sombre premium avec sidebar. Fond anthracite profond (#0e0e18), texte clair, accent dore. Typo display: Bebas Neue ou Playfair Display pour les titres, Barlow pour le corps. Sidebar gauche sombre avec infos contact et competences en tags. Zone principale claire (#faf9f7). Texture grain subtile.",
    defaultColor: "#c9a55a",
    defaultLayout: "sidebar",
  },
  {
    name: "Mineral",
    tag: "clean",
    description:
      "Design epure editorial sur fond blanc casse. Typo: Cormorant Garamond pour le nom en grande taille, Source Sans Pro pour le corps. Header centre avec nom en capitales tres espacees (letter-spacing: 6px). Ligne de separation fine. Accent terracotta sur titres de section. Beaucoup d'espace blanc.",
    defaultColor: "#e17055",
    defaultLayout: "single",
  },
  {
    name: "Atlantic",
    tag: "split",
    description:
      "Deux colonnes bicolores contrastees. Colonne gauche (38%) bleu profond (#0a3d62 vers #1e3799 en gradient) avec nom et contact en blanc. Colonne droite blanche avec experiences. Typo: Montserrat bold pour titres, Lato pour corps. Accent dore pour competences.",
    defaultColor: "#f6b93b",
    defaultLayout: "double",
  },
  {
    name: "Swiss",
    tag: "minimal",
    description:
      "Ultra minimaliste typographique. Fond blanc pur. Nom en 48px font-weight 200 avec letter-spacing 8px. Un seul separateur horizontal noir epais. Aucune couleur sauf le noir. Typo: Outfit extra-light pour le nom, weight 400 pour le corps. Grille rigoureuse.",
    defaultColor: "#222222",
    defaultLayout: "single",
  },
  {
    name: "Vermillon",
    tag: "bold",
    description:
      "Impact visuel maximal. Header pleine largeur en gradient rouge (#e74c3c vers #c0392b) avec nom en blanc extra-bold. Corps blanc en dessous. Typo: Poppins 800 pour le nom, DM Sans pour le corps. Titres de section en rouge avec underline epaisse.",
    defaultColor: "#e74c3c",
    defaultLayout: "single",
  },
  {
    name: "Emeraude",
    tag: "nature",
    description:
      "Elegance naturelle. Fine bande verte emeraude (5px) sur le bord gauche. Fond off-white (#f0f5f0). Typo: Playfair Display italic pour le nom, Nunito pour le corps. Titres verts (#27ae60) discrets. Ambiance calme et professionnelle.",
    defaultColor: "#27ae60",
    defaultLayout: "sidebar",
  },
];
