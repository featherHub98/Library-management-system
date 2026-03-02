import { Document } from 'mongoose';

export type BookFormat = 'ebook' | 'physical';
export type BookStockStatus = 'in_stock' | 'out_of_stock';

export interface IBook extends Document {
  title: string;
  author: string;
  basePrice: number;           // input price before adjustments
  format: BookFormat;         // ebook or physical
  price: number;              // computed/sell price
  stock: number;
  status: BookStockStatus;
  isbn?: string;
  barcode?: string;
  categories?: string[];
  language?: string;
  edition?: number;
  volume?: number;
  series?: string;
  description?: string;
  publishedDate?: Date;
  publisher?: string;
  pages?: number;
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
  stock: number;
  status: BookStockStatus;
  isbn?: string;
  barcode?: string;
  categories?: string[];
  language?: string;
  edition?: number;
  volume?: number;
  series?: string;
  description?: string;
  publishedDate?: Date;
  publisher?: string;
  pages?: number;
  createdAt: Date;
  updatedAt: Date;
}