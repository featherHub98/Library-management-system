import mongoose,{Schema, Document} from "mongoose";
import { IBook } from "../../interfaces/book.interface";

const BookSchema: Schema = new Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    author:{
        type: String,
        required: true,
        trim: true
    },
    basePrice:{
        type: Number,
        required: true
    },
    format:{
        type: String,
        required: true,
        enum: ['ebook','physical']
    },
    price:{
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['in_stock', 'out_of_stock'],
        default: 'out_of_stock'
    },
    isbn: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    categories: [{
        type: String,
        trim: true
    }],
    language: {
        type: String,
        default: 'English'
    },
    edition: {
        type: Number,
        default: 1
    },
    volume: {
        type: Number
    },
    series: {
        type: String,
        trim: true
    },
    description: {
        type: String
    },
    publishedDate: {
        type: Date
    },
    publisher: {
        type: String,
        trim: true
    },
    pages: {
        type: Number
    }
},{
    timestamps: true
});

BookSchema.index({ isbn: 1 });
BookSchema.index({ barcode: 1 });
BookSchema.index({ categories: 1 });
BookSchema.index({ series: 1 });
BookSchema.index({ title: 'text', author: 'text', description: 'text' });

BookSchema.pre<IBook>('save', function(next) {
    if (this.isModified('basePrice') || this.isModified('format')) {
        this.price = this.format === 'ebook' ? this.basePrice * 0.9 : this.basePrice;
    }

    if (this.format === 'ebook') {
        this.stock = 0;
        this.status = 'in_stock';
    } else {
        this.status = this.stock > 0 ? 'in_stock' : 'out_of_stock';
    }

    next();
});

export default mongoose.model<IBook>("Book", BookSchema);