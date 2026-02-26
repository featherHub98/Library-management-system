import { Document } from 'mongoose';

export type BookFormat = 'ebook' | 'physical';

export interface IBook extends Document {
  title: string;
  author: string;
  basePrice: number;           // input price before adjustments
  format: BookFormat;         // ebook or physical
  price: number;              // computed/sell price
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookResponse {
  id: string;
  title: string;
  author: string;
  basePrice: number;
  format: BookFormat;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}