# Book Service - Dual Database Implementation

## Overview

This service implements a dual database architecture for book management:
- **MongoDB**: Stores book metadata (title, author, price)
- **PostgreSQL**: Stores book images with shared IDs
- **Automatic Cleanup**: When a book is deleted from MongoDB, its image is automatically removed from PostgreSQL

## Architecture Changes

### Database Configuration

**Added PostgreSQL connection** using Sequelize ORM alongside existing MongoDB connection:

```typescript
// src/config/database.ts
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'bookstore',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || 'password',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  }
);
```

### Models

#### MongoDB Book Model (Unchanged)
```typescript
// src/models/mongo/Book.ts
const BookSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
}, { timestamps: true });
```

#### PostgreSQL BookImage Model (New)
```typescript
// src/models/postgres/BookImage.ts
BookImage.init({
  id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
  imageData: { type: DataTypes.BLOB('long'), allowNull: false },
  mimeType: { type: DataTypes.STRING, allowNull: false },
  fileName: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize,
  modelName: 'BookImage',
  tableName: 'book_images',
  timestamps: true,
});
```

### Services

#### ImageService (New)
Handles all PostgreSQL operations for images:
- `saveImage()`: Stores image data with shared book ID
- `getImage()`: Retrieves image by book ID
- `deleteImage()`: Removes image from PostgreSQL
- `imageExists()`: Checks if image exists

#### BookService (Modified)
Updated `deleteBook()` method to cascade delete images:
```typescript
async deleteBook(bookId: string): Promise<IBook | null> {
  const book = await Book.findByIdAndDelete(bookId);
  if (book) {
    await ImageService.deleteImage(bookId); // Cascade delete
  }
  return book;
}
```

### Controllers

#### ImageController (New)
Handles HTTP requests for image operations:
- `uploadImage()`: Accepts multipart/form-data image uploads
- `getImage()`: Returns image data with proper MIME types
- `deleteImage()`: Removes images via API

### Routes

**Added image routes** to existing book routes:
```typescript
// src/routes/book.routes.ts
router.post('/:bookId/image', upload.single('image'), ImageController.uploadImage);
router.get('/:bookId/image', ImageController.getImage);
router.delete('/:bookId/image', ImageController.deleteImage);
```

## API Endpoints

### Book Operations (Existing)
- `POST /api/books` - Create book
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book (now cascades to image)

### Image Operations (New)
- `POST /api/books/:bookId/image` - Upload image for book
- `GET /api/books/:bookId/image` - Get book image
- `DELETE /api/books/:bookId/image` - Delete book image

## Configuration

### Environment Variables (.env)
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bookstore

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=bookstore
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Server Configuration
PORT=3001
```

### Docker Compose
Added PostgreSQL service:
```yaml
postgres:
  image: postgres:latest
  environment:
    POSTGRES_DB: bookstore
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: password
  ports:
    - "5432:5432"
  volumes:
    - postgresdata:/var/lib/postgresql/data
```

## Dependencies Added

- `multer` & `@types/multer`: File upload handling
- `express-validator`: Request validation
- `dotenv`: Environment variable management

## Data Flow

1. **Create Book**: Book metadata → MongoDB
2. **Upload Image**: Image data → PostgreSQL (same ID as book)
3. **Delete Book**: Book metadata deleted from MongoDB → Image automatically deleted from PostgreSQL
4. **Retrieve Data**: Book metadata from MongoDB, image from PostgreSQL

## Key Benefits

- **Scalability**: Different databases optimized for different data types
- **Consistency**: Shared IDs ensure data integrity
- **Automatic Cleanup**: No orphaned images when books are deleted
- **Performance**: MongoDB for flexible metadata, PostgreSQL for binary data

## Running the Service

1. **Start databases**:
   ```bash
   docker-compose up -d mongodb postgres
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build and run**:
   ```bash
   npm run build
   npm start
   ```

## Testing

### Upload Image
```bash
curl -X POST \
  http://localhost:3001/api/books/{bookId}/image \
  -F "image=@path/to/image.jpg"
```

### Get Image
```bash
curl http://localhost:3001/api/books/{bookId}/image \
  -o downloaded_image.jpg
```

### Delete Book (Cascades to Image)
```bash
curl -X DELETE http://localhost:3001/api/books/{bookId}
```</content>
<parameter name="filePath">c:\Users\yboua\Desktop\hamma pfe\Library-management-system\book-service\README.md