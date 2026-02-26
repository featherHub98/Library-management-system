# Book Management Features

This document describes the newly added book management functionality in the Library Management System frontend.

## Overview

The frontend now includes a comprehensive book management interface with the following features:
- **Book Grid**: Display all books in a responsive grid layout
- **Edit Book Modal**: Edit book details through a modal dialog
- **Delete Functionality**: Remove books with confirmation

## Features

### 1. Book Grid Page
- **Location**: `/[lang]/books` (e.g., `/en/books`, `/fr/books`, `/ar/books`)
- **Layout**: Responsive grid using Material-UI Grid component
- **Display**: Each book shown in a card with title, author, and price
- **Navigation**: Accessible via the "Books" link in the navbar

### 2. Edit Book Modal
- **Trigger**: Click the "Edit" button on any book card
- **Fields**:
  - Title (text input)
  - Author (text input)
  - Price (number input)
- **Actions**:
  - Save: Updates the book and refreshes the grid
  - Cancel: Closes the modal without changes

### 3. Delete Book Functionality
- **Trigger**: Click the "Delete" button on any book card
- **Confirmation**: Browser confirmation dialog ("Are you sure you want to delete this book?")
- **Action**: Removes the book from the database and updates the grid

## Technical Implementation

### Frontend Components
- **Page**: `app/[lang]/books/page.tsx` - Main books page component
- **Styling**: Material-UI components for consistent design
- **State Management**: React hooks (useState, useEffect)
- **Internationalization**: Supports English, French, and Arabic

### API Integration
- **Base Routes**:
  - `GET /api/books` - Fetch all books
  - `POST /api/books` - Create new book
- **Dynamic Routes**:
  - `PUT /api/books/[id]` - Update book by ID
  - `DELETE /api/books/[id]` - Delete book by ID
- **Backend Proxy**: API routes proxy requests to the book-service microservice

### Data Structure
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
}
```

## Usage

1. **View Books**: Navigate to the Books page via the navbar
2. **Edit Book**:
   - Click "Edit" on a book card
   - Modify the fields in the modal
   - Click "Save" to update
3. **Delete Book**:
   - Click "Delete" on a book card
   - Confirm the deletion in the dialog

## Dependencies

- **Material-UI**: For UI components (Grid, Card, Dialog, etc.)
- **Next.js**: For routing and API routes
- **TypeScript**: For type safety
- **React**: For component logic

## Future Enhancements

- Add book creation functionality
- Implement search and filtering
- Add pagination for large book collections
- Include book images display
- Add bulk operations (delete multiple books)

## Notes

- The API routes expect the book-service to be running on the configured URL
- Error handling is implemented for failed API requests
- The interface is fully responsive and works on mobile devices
- Internationalization is supported through the existing dictionary system