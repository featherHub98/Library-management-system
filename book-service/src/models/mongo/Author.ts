import mongoose, { Schema, Document } from 'mongoose';
import { IAuthor, CVEducation, CVExperience, CVPublication, CVAward, CVData, CVFile } from '../../interfaces/author.interface';

const CVEducationSchema: Schema = new Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  field: { type: String, required: true, trim: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: false },
  description: { type: String, required: false, trim: true }
}, { _id: false });

const CVExperienceSchema: Schema = new Schema({
  company: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: false },
  description: { type: String, required: false, trim: true }
}, { _id: false });

const CVPublicationSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  publisher: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  isbn: { type: String, required: false, trim: true }
}, { _id: false });

const CVAwardSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  description: { type: String, required: false, trim: true }
}, { _id: false });

const CVDataSchema: Schema = new Schema({
  education: { type: [CVEducationSchema], required: false },
  experience: { type: [CVExperienceSchema], required: false },
  publications: { type: [CVPublicationSchema], required: false },
  awards: { type: [CVAwardSchema], required: false },
  skills: { type: [String], required: false }
}, { _id: false });

const CVFileSchema: Schema = new Schema({
  data: { type: Buffer, required: true },
  mimeType: { type: String, required: true },
  fileName: { type: String, required: true }
}, { _id: false });

const AuthorSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  bio: {
    type: String,
    required: false,
    trim: true,
    maxlength: 5000
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    sparse: true,
    unique: true
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    maxlength: 20
  },
  nationality: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  birthDate: {
    type: Date,
    required: false
  },
  website: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  cvData: {
    type: CVDataSchema,
    required: false
  },
  cvFile: {
    type: CVFileSchema,
    required: false
  }
}, {
  timestamps: true
});

// Index for faster searches
AuthorSchema.index({ name: 'text' });
AuthorSchema.index({ nationality: 1 });

export default mongoose.model<IAuthor>('Author', AuthorSchema);
