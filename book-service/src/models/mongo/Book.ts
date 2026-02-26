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
},{
    timestamps: true
});

BookSchema.pre<IBook>('save', function(next) {
    if (this.isModified('basePrice') || this.isModified('format')) {
        this.price = this.format === 'ebook' ? this.basePrice * 0.9 : this.basePrice;
    }
    next();
});

export default mongoose.model<IBook>("Book", BookSchema);