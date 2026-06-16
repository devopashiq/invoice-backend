import { Document, Types } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  passengerName: string | null;
  pnr: string | null;
  airline: string | null;
  flightNumber: string | null;
  departure: string | null;
  destination: string | null;
  travelDate: string | null;
  amount: number | null;
  currency: string | null;
  rawOcrText?: string;
  templateId?: Types.ObjectId | null;
  pdfPath?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITemplate extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  customCss?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Express Request type to include user details after authentication
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
