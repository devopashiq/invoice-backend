import { Schema, model } from 'mongoose';
import { IInvoice } from '../types';

const invoiceSchema = new Schema<IInvoice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    passengerName: {
      type: String,
      default: null,
    },
    pnr: {
      type: String,
      default: null,
    },
    airline: {
      type: String,
      default: null,
    },
    flightNumber: {
      type: String,
      default: null,
    },
    departure: {
      type: String,
      default: null,
    },
    destination: {
      type: String,
      default: null,
    },
    travelDate: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: null,
    },
    rawOcrText: {
      type: String,
      default: '',
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      default: null,
    },
    pdfPath: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const InvoiceModel = model<IInvoice>('Invoice', invoiceSchema);
export default InvoiceModel;
