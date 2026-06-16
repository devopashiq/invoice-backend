import { Schema, model } from 'mongoose';
import { ITemplate } from '../types';

const templateSchema = new Schema<ITemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    primaryColor: {
      type: String,
      required: true,
      default: '#1e3a8a', // default dark blue
    },
    secondaryColor: {
      type: String,
      required: true,
      default: '#3b82f6', // default light blue
    },
    logoUrl: {
      type: String,
      default: null,
    },
    companyName: {
      type: String,
      required: true,
    },
    companyAddress: {
      type: String,
      required: true,
    },
    companyPhone: {
      type: String,
      required: true,
    },
    companyEmail: {
      type: String,
      required: true,
    },
    customCss: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const TemplateModel = model<ITemplate>('Template', templateSchema);
export default TemplateModel;
