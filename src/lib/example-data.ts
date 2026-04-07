import type { CVData } from "./types";

/** Example data used to render template previews */
export const EXAMPLE_CV: CVData = {
  firstName: "Marie",
  lastName: "Laurent",
  title: "Responsable de Projets",
  phone: "06 45 78 12 34",
  email: "m.laurent@email.com",
  address: "Lyon, France",
  birthDate: "",
  profile: "Responsable de projets avec 8 ans d'experience en pilotage d'equipes et gestion de portefeuilles clients. Reconnue pour ma capacite a structurer les processus, fideliser les clients et accompagner la montee en competences des collaborateurs.",
  experiences: [
    {
      title: "Responsable de Projets",
      company: "Nexia Consulting",
      location: "Lyon",
      startDate: "2021",
      endDate: "Present",
      description: "",
      tasks: [
        "Pilotage d'un portefeuille de 12 clients grands comptes",
        "Coordination d'une equipe de 6 consultants",
        "Taux de renouvellement client de 78% a 94%",
        "Mise en place de tableaux de bord et KPIs",
      ],
    },
    {
      title: "Cheffe de Projet",
      company: "Groupe Adeva",
      location: "Paris",
      startDate: "2018",
      endDate: "2021",
      description: "",
      tasks: [
        "Gestion de projets, budgets de 200K a 1.2M€",
        "Animation de comites de pilotage et reporting DG",
        "15 projets livres dans les delais et budgets",
      ],
    },
    {
      title: "Chargee de Clientele",
      company: "BPI Solutions",
      location: "Lyon",
      startDate: "2016",
      endDate: "2018",
      description: "",
      tasks: [
        "Developpement d'un portefeuille de 40 PME",
        "Prospection commerciale et negociation de contrats",
      ],
    },
  ],
  education: [
    { degree: "Master Management", school: "EM Lyon", year: "2016" },
    { degree: "Licence Eco-Gestion", school: "Univ. Lyon 2", year: "2014" },
  ],
  skills: [
    "Gestion de projet",
    "Management",
    "Relation client",
    "Pilotage budget",
    "Salesforce",
    "Agile / Scrum",
  ],
  languages: [
    { name: "Francais", level: "Natif" },
    { name: "Anglais", level: "Courant" },
    { name: "Espagnol", level: "Notions" },
  ],
  interests: ["Randonnee", "Benevolat", "Lecture", "Yoga"],
  certifications: [],
};
