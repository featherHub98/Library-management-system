import e from 'express';
import { IBookResponse } from '../interfaces/book.interface';
import { BookFormat } from '../interfaces/book.interface';

export interface CreateBookDto  {
  title: string;
  author: string;
  basePrice: number;
  format: BookFormat;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  basePrice?: number;
  format?: BookFormat;
}

export interface BookResponseDto {
  message: string;
  book: {
    id: string;
    title: string;
    author: string;
    basePrice: number;
    format: BookFormat;
    price: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface BooksResponseDto {
  books: IBookResponse[];
  count: number;
}
export interface BookResponseDto {
  message: string;
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface BooksResponseDto {
  books: IBookResponse[];
  count: number;
}

