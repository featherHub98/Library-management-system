import e from 'express';
import { IBookResponse } from '../interfaces/book.interface';
import { BookFormat, BookStockStatus } from '../interfaces/book.interface';

export interface CreateBookDto  {
  title: string;
  author: string;
  basePrice: number;
  format: BookFormat;
  stock?: number;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  basePrice?: number;
  format?: BookFormat;
  stock?: number;
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
    stock: number;
    status: BookStockStatus;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface BooksResponseDto {
  books: IBookResponse[];
  count: number;
}

