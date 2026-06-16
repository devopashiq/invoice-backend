import { Types } from 'mongoose';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { OcrService } from './ocr.service';
import { IInvoice } from '../types';
import { UpdateInvoiceDTO } from '../dtos/invoice.dto';

export class InvoiceService {
  private invoiceRepository = new InvoiceRepository();
  private ocrService = new OcrService();

  async processUpload(userId: string, filePath: string, mimeType: string): Promise<IInvoice> {
    // 1. Extract raw text from file
    const rawOcrText = await this.ocrService.extractText(filePath, mimeType);

    // 2. Parse text into structured fields
    const parsedData = this.ocrService.parseInvoiceFields(rawOcrText);

    // 3. Create a draft invoice in database
    const invoice = await this.invoiceRepository.create({
      userId: userId as any,
      passengerName: parsedData.passengerName,
      pnr: parsedData.pnr,
      airline: parsedData.airline,
      flightNumber: parsedData.flightNumber,
      departure: parsedData.departure,
      destination: parsedData.destination,
      travelDate: parsedData.travelDate,
      amount: parsedData.amount,
      currency: parsedData.currency,
      rawOcrText: rawOcrText,
    });

    return invoice;
  }

  async getInvoice(id: string, userId: string): Promise<IInvoice> {
    const invoice = await this.invoiceRepository.findById(id, userId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async getUserInvoices(userId: string): Promise<IInvoice[]> {
    return this.invoiceRepository.findByUserId(userId);
  }

  async updateInvoice(id: string, userId: string, data: UpdateInvoiceDTO): Promise<IInvoice> {
    const updateData: any = { ...data };
    if (data.templateId) {
      updateData.templateId = new Types.ObjectId(data.templateId);
    } else if (data.templateId === null) {
      updateData.templateId = null;
    }

    const invoice = await this.invoiceRepository.update(id, userId, updateData);
    if (!invoice) {
      throw new Error('Invoice not found or unauthorized');
    }
    return invoice;
  }

  async deleteInvoice(id: string, userId: string): Promise<void> {
    const invoice = await this.invoiceRepository.delete(id, userId);
    if (!invoice) {
      throw new Error('Invoice not found or unauthorized');
    }
  }
}
