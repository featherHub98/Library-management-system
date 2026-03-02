import { Document } from 'mongoose';

export interface IReview extends Document {
  bookId: string;
  userId: string;
  username: string;
  rating: number;
  title: string;
  text: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewResponse {
  id: string;
  bookId: string;
  userId: string;
  username: string;
  rating: number;
  title: string;
  text: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookWithRatings {
  id: string;
  title: string;
  author: string;
  basePrice: number;
  format: string;
  price: number;
  stock: number;
  status: string;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
