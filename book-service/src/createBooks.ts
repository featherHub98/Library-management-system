import mongoose from 'mongoose';
import Book from './models/mongo/Book';

const sampleBooks = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    basePrice: 12.99,
    format: 'physical',
    price: 12.99,
    stock: 25
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    basePrice: 14.99,
    format: 'physical',
    price: 14.99,
    stock: 18
  },
  {
    title: '1984',
    author: 'George Orwell',
    basePrice: 13.99,
    format: 'ebook',
    price: 12.59,
    stock: 0
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    basePrice: 10.99,
    format: 'physical',
    price: 10.99,
    stock: 22
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    basePrice: 15.99,
    format: 'physical',
    price: 15.99,
    stock: 15
  },
  {
    title: 'Brave New World',
    author: 'Aldous Huxley',
    basePrice: 14.99,
    format: 'ebook',
    price: 13.49,
    stock: 0
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    basePrice: 16.99,
    format: 'physical',
    price: 16.99,
    stock: 30
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    basePrice: 18.99,
    format: 'physical',
    price: 18.99,
    stock: 12
  },
  {
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    basePrice: 11.99,
    format: 'ebook',
    price: 10.79,
    stock: 0
  },
  {
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    basePrice: 25.99,
    format: 'physical',
    price: 25.99,
    stock: 8
  }
];

const createBooks = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://admin:secret@localhost:27017/bookstore?authSource=admin';
    
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    const existingBooks = await Book.countDocuments();
    if (existingBooks >= 10) {
      console.log('✓ Books already exist in database');
      await mongoose.disconnect();
      process.exit(0);
    }

    await Book.deleteMany({});
    const createdBooks = await Book.insertMany(sampleBooks);

    console.log(`✓ Successfully created ${createdBooks.length} books:`);
    createdBooks.forEach((book, index) => {
      console.log(`  ${index + 1}. "${book.title}" by ${book.author} - ${book.format} ($${book.price})`);
    });

    await mongoose.disconnect();
    console.log('✓ Connection closed');
    process.exit(0);

  } catch (error) {
    console.error('✗ Error creating books:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createBooks();
