import { Document } from 'mongoose';

export interface CVEducation {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

export interface CVExperience {
  company: string;
  position: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

export interface CVPublication {
  title: string;
  publisher: string;
  year: number;
  isbn?: string;
}

export interface CVAward {
  title: string;
  organization: string;
  year: number;
  description?: string;
}

export interface CVData {
  education?: CVEducation[];
  experience?: CVExperience[];
  publications?: CVPublication[];
  awards?: CVAward[];
  skills?: string[];
}

export interface CVFile {
  data: Buffer;
  mimeType: string;
  fileName: string;
}

export interface IAuthor extends Document {
  name: string;
  bio?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  birthDate?: Date;
  website?: string;
  cvData?: CVData;
  cvFile?: CVFile;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthorResponse {
  id: string;
  name: string;
  bio?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  birthDate?: Date;
  website?: string;
  cvData?: CVData;
  hasCVFile: boolean;
  createdAt: Date;
  updatedAt: Date;
}
