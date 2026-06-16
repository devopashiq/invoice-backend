import { Response } from "express";
import path from "path";
import fs from "fs";
import { InvoiceService } from "../services/invoice.service";
import { TemplateService } from "../services/template.service";
import { PdfService } from "../services/pdf.service";
import { AuthRequest } from "../types";

export class InvoiceController {
  private invoiceService = new InvoiceService();
  private templateService = new TemplateService();
  private pdfService = new PdfService();

  uploadInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          status: "error",
          message: "No file uploaded",
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      const invoice = await this.invoiceService.processUpload(
        req.user.id,
        req.file.path,
        req.file.mimetype,
      );

      res.status(201).json({
        status: "success",
        data: invoice,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Error processing invoice upload",
      });
    }
  };

  getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      const invoices = await this.invoiceService.getUserInvoices(req.user.id);
      res.status(200).json({
        status: "success",
        data: invoices,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Error fetching invoices",
      });
    }
  };

  getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      const invoice = await this.invoiceService.getInvoice(
        req.params.id,
        req.user.id,
      );
      res.status(200).json({
        status: "success",
        data: invoice,
      });
    } catch (error: any) {
      res.status(404).json({
        status: "error",
        message: error.message || "Invoice not found",
      });
    }
  };

  updateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      const updated = await this.invoiceService.updateInvoice(
        req.params.id,
        req.user.id,
        req.body,
      );

      res.status(200).json({
        status: "success",
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Error updating invoice",
      });
    }
  };

  deleteInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      await this.invoiceService.deleteInvoice(req.params.id, req.user.id);
      res.status(200).json({
        status: "success",
        message: "Invoice deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Error deleting invoice",
      });
    }
  };

  generatePdf = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Unauthorized" });
        return;
      }

      const invoice = await this.invoiceService.getInvoice(
        req.params.id,
        req.user.id,
      );
      const templateId = req.body.templateId || invoice.templateId;

      if (!templateId) {
        res.status(400).json({
          status: "error",
          message: "templateId is required to generate PDF",
        });
        return;
      }

      const template = await this.templateService.getTemplate(
        templateId.toString(),
        req.user.id,
      );
      await this.pdfService.generateInvoicePdf(invoice, template);

      // Refresh invoice data to return the updated record (with pdfPath)
      const updatedInvoice = await this.invoiceService.getInvoice(
        req.params.id,
        req.user.id,
      );

      res.status(200).json({
        status: "success",
        data: updatedInvoice,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Error generating PDF",
      });
    }
  };

  downloadPdf = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log("Download PDF request received for invoice ID:", req.user);
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Unauthorized" });
        return;
      }

      const invoice = await this.invoiceService.getInvoice(
        req.params.id,
        req.user.id,
      );

      if (!invoice.pdfPath) {
        res.status(400).json({
          status: "error",
          message: "PDF has not been generated for this invoice yet",
        });
        return;
      }

      const fullPath = path.join(__dirname, "../..", invoice.pdfPath);

      if (!fs.existsSync(fullPath)) {
        res.status(404).json({
          status: "error",
          message: "PDF file not found on server storage",
        });
        return;
      }

      // res.download(fullPath, `invoice-${invoice.pnr || "ticket"}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.pnr || 'ticket'}.pdf"`);
res.sendFile(fullPath);
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Error downloading PDF",
      });
    }
  };
}
