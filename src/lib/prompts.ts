export const EXTRACTION_PROMPT = `Tu es un expert en extraction de donnees de CV. Analyse le contenu suivant et extrais toutes les informations dans le format JSON ci-dessous. Si une information est manquante, utilise une chaine vide "". Pour les tableaux vides, utilise [].

FORMAT JSON ATTENDU:
{
  "firstName": "",
  "lastName": "",
  "title": "",
  "phone": "",
  "email": "",
  "address": "",
  "birthDate": "",
  "profile": "",
  "experiences": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "tasks": []
    }
  ],
  "education": [
    { "degree": "", "school": "", "year": "" }
  ],
  "skills": [],
  "languages": [{ "name": "", "level": "" }],
  "interests": [],
  "certifications": []
}

REGLES:
- Reponds UNIQUEMENT avec le JSON, sans texte avant ou apres, sans backticks markdown
- Dates au format lisible (ex: "Janvier 2020", "2020")
- Tasks: liste de bullet points descriptifs des missions
- Profile: reformule en 2-3 phrases professionnelles si necessaire
- Skills: extrais chaque competence individuellement

CV A ANALYSER:
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
