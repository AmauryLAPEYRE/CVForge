export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  tasks: string[];
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface CVData {
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  profile: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  interests: string[];
  certifications: string[];
}

export interface GeneratedCV {
  id: string;
  name: string;
  style: string;
  html: string;
  accentColor: string;
  layout: "single" | "double" | "sidebar";
}

export type Step = 0 | 1 | 2;

export interface AppState {
  step: Step;
  cvData: CVData | null;
  jobOffer: string;
  generatedCVs: GeneratedCV[];
  selectedCVId: string | null;
  isExtracting: boolean;
  isGenerating: boolean;
}
