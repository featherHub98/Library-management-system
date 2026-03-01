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
    }
},{
    timestamps: true
});

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