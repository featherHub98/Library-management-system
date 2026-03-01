import {
  CVEducation,
  CVExperience,
  CVPublication,
  CVAward,
  CVData,
  IAuthorResponse
} from '../interfaces/author.interface';

export interface CreateAuthorDto {
  name: string;
  bio?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  birthDate?: Date | string;
  website?: string;
  cvData?: CVData;
}

export interface UpdateAuthorDto {
  name?: string;
  bio?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  birthDate?: Date | string;
  website?: string;
  cvData?: CVData;
}

export interface CVEducationDto extends CVEducation {}

export interface CVExperienceDto extends CVExperience {}

export interface CVPublicationDto extends CVPublication {}

export interface CVAwardDto extends CVAward {}

export interface CVDataDto extends CVData {}

export interface AuthorResponseDto extends IAuthorResponse {}

export interface AuthorsListResponseDto {
  authors: IAuthorResponse[];
  count: number;
  total: number;
  page: number;
  limit: number;
}

export interface GeneratedCVDto {
  authorName: string;
  generatedAt: Date;
  bio?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  website?: string;
  cvData?: CVData;
}

export interface AuthorQueryDto {
  search?: string;
  nationality?: string;
  page?: number;
  limit?: number;
}
