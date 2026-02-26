import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database';

export interface IBookImage {
  id: string; // Shared ID with MongoDB book
  imageData: Buffer;
  mimeType: string;
  fileName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class BookImage extends Model<IBookImage> implements IBookImage {
  public id!: string;
  public imageData!: Buffer;
  public mimeType!: string;
  public fileName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BookImage.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    imageData: {
      type: DataTypes.BLOB('long'),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'BookImage',
    tableName: 'book_images',
    timestamps: true,
  }
);

export default BookImage;