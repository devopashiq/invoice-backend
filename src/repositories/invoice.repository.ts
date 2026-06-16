import InvoiceModel from '../models/Invoice';
import { IInvoice } from '../types';

export class InvoiceRepository {
  async findById(id: string, userId: string): Promise<IInvoice | null> {
    return InvoiceModel.findOne({ _id: id, userId }).exec();
  }

  async findByUserId(userId: string): Promise<IInvoice[]> {
    return InvoiceModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async create(invoiceData: Partial<IInvoice>): Promise<IInvoice> {
    const invoice = new InvoiceModel(invoiceData);
    return invoice.save();
  }

  async update(id: string, userId: string, updateData: Partial<IInvoice>): Promise<IInvoice | null> {
    return InvoiceModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async delete(id: string, userId: string): Promise<IInvoice | null> {
    return InvoiceModel.findOneAndDelete({ _id: id, userId }).exec();
  }
}
