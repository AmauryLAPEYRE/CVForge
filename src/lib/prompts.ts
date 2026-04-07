export const EXTRACTION_PROMPT = `Extrais les donnees de ce CV en JSON. Champs: firstName, lastName, title, phone, email, address, birthDate, profile (2-3 phrases), experiences [{title,company,location,startDate,endDate,description,tasks:[]}], education [{degree,school,year}], skills [], languages [{name,level}], interests [], certifications []. Reponds UNIQUEMENT avec le JSON brut, sans backticks.

CV:
`;

export const REWRITE_PROMPT = `Tu es un expert en redaction de CV. Reecris le contenu du CV pour matcher l'offre d'emploi ci-dessous.

OFFRE D'EMPLOI:
{{JOB_OFFER}}

CV ACTUEL (JSON):
{{CV_DATA}}

REGLES:
- Reecris le profil pour matcher le poste
- Reordonne les experiences (les plus pertinentes en premier)
- Met en avant les competences qui matchent l'offre
- Adapte le vocabulaire au secteur de l'offre
- Ne change PAS les faits (dates, noms d'entreprises)
- Reponds UNIQUEMENT avec le JSON modifie, meme format que l'entree, sans backticks markdown
`;

export const FRONTEND_DESIGN_GUIDELINES = `
## DESIGN GUIDELINES — Production-Grade CV Design

Tu es un designer frontend expert. Tu crees des CV qui sont visuellement frappants, memorables et professionnels. Chaque CV doit avoir un point de vue esthetique clair et affirme.

### REGLES ABSOLUES — Ce que tu ne fais JAMAIS :
- JAMAIS de polices generiques (Arial, Inter, Roboto, Helvetica, system fonts, sans-serif par defaut)
- JAMAIS de schemas de couleurs cliches (violet sur blanc, bleu corporate fade)
- JAMAIS de layouts previsibles et cookie-cutter
- JAMAIS de design qui ressemble a du "genere par IA"

### TYPOGRAPHIE
- Choisis des polices DISTINCTIVES et INTERESSANTES via Google Fonts @import
- Paire une police display (titres) avec une police body raffinee
- Exemples de bonnes paires : Playfair Display + Barlow, Bebas Neue + DM Sans, Cormorant Garamond + Source Sans Pro, Syne + Outfit
- Le nom du candidat doit avoir un traitement typographique fort (taille, poids, espacement)

### COULEUR ET THEME
- Palette dominante avec accents tranchants — pas de couleurs timides reparties uniformement
- Utilise CSS custom properties pour la coherence
- Les fonds ne sont JAMAIS du blanc pur (#fff) — utilise des off-whites (#faf9f7, #f8f7f4) ou des sombres profonds (#0e0e18)
- Contraste fort entre les sections

### COMPOSITION SPATIALE
- Asymetrie, overlap, flux diagonal quand c'est pertinent
- Elements qui cassent la grille
- Espace negatif genereux OU densite controlee — pas de milieu mou
- Hierarchie visuelle claire : le regard doit suivre un chemin naturel

### DETAILS VISUELS ET PROFONDEUR
- Cree de l'atmosphere et de la profondeur, pas des aplats de couleur
- Gradients subtils, textures, ombres portees, bordures decoratives
- Separateurs de section sophistiques (pas de simples <hr>)
- Tags/badges pour les competences avec un style propre

### TECHNIQUE
- HTML complet et autonome avec <style> integre
- Google Fonts via @import dans le <style>
- Format A4 (210mm x 297mm) avec .page { width: 210mm; min-height: 297mm; }
- print-color-adjust: exact et -webkit-print-color-adjust: exact sur *
- @media print { @page { size: A4; margin: 0; } }
- Tout doit tenir sur UNE page A4
- Pas de JavaScript

### RESULTAT ATTENDU
Chaque CV doit donner l'impression d'avoir ete concu par un designer humain talentueux, pas genere par une machine. Il doit etre MEMORABLE — quelqu'un qui le voit doit se dire "wow, c'est beau".
`;

