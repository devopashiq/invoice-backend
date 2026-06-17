import path from 'path';
import fs from 'fs';
import { IInvoice, ITemplate } from '../types';
import { InvoiceRepository } from '../repositories/invoice.repository';

const dynamicImport = (modulePath: string) => eval(`import('${modulePath}')`);

export class PdfService {
  private invoiceRepository = new InvoiceRepository();

  private async getLaunchOptions() {
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      const chromium = (await dynamicImport('@sparticuz/chromium')).default;
      return {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };
    }

    return {
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
  }

  async generateInvoicePdf(invoice: IInvoice, template: ITemplate): Promise<string> {
    const puppeteer = (await dynamicImport('puppeteer-core')).default;

    const htmlContent = this.buildHtmlContent(invoice, template);

    const pdfsDir = path.join(__dirname, '../../uploads/pdfs');
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }

    const fileName = `invoice-${invoice._id}.pdf`;
    const outputPath = path.join(pdfsDir, fileName);

    const launchOptions = await this.getLaunchOptions();
    const browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '40px', bottom: '50px', left: '40px', right: '40px' },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="font-family: Arial, sans-serif; font-size: 8px; color: #888888; width: 100%; display: flex; justify-content: space-between; padding: 0 40px; box-sizing: border-box;">
            <span>Generated via ${template.companyName}</span>
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        `,
      });

      const relativePath = `/uploads/pdfs/${fileName}`;
      await this.invoiceRepository.update(invoice._id.toString(), invoice.userId.toString(), {
        pdfPath: relativePath,
        templateId: template._id as any,
      });

      return outputPath;
    } finally {
      await browser.close();
    }
  }

 private buildHtmlContent(invoice: IInvoice, template: ITemplate): string {
    const primaryColor = template.primaryColor || '#1e3a8a';
    const secondaryColor = template.secondaryColor || '#3b82f6';
    const logoHtml = template.logoUrl 
      ? `<img src="${template.logoUrl}" alt="Logo" class="logo" />` 
      : `<div class="logo-fallback" style="background-color: ${primaryColor};">${template.companyName.charAt(0)}</div>`;

    const formattedAmount = invoice.amount !== null 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.amount)
      : 'N/A';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${invoice.pnr || 'Receipt'}</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            margin: 0;
            padding: 0;
            line-height: 1.5;
            font-size: 14px;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
          }
          .invoice-container {
            padding: 30px;
            max-width: 100%;
          }
          
          /* Header Styling */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 3px solid ${primaryColor};
            margin-bottom: 30px;
          }
          .logo-container {
            max-width: 200px;
          }
          .logo {
            max-height: 60px;
            width: auto;
          }
          .logo-fallback {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
          }
          .company-details {
            text-align: right;
            font-size: 12px;
            color: #555555;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 5px;
          }

          /* Title & Meta Info */
          .invoice-meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: ${primaryColor};
            text-transform: uppercase;
          }
          .meta-details {
            text-align: right;
            font-size: 13px;
          }
          .meta-item {
            margin-bottom: 4px;
          }
          .meta-label {
            font-weight: bold;
            color: #555555;
          }

          /* Details Section */
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: ${primaryColor};
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .detail-block {
            background-color: #f9fafb;
            border-left: 3px solid ${secondaryColor};
            padding: 10px 15px;
            border-radius: 0 6px 6px 0;
          }
          .detail-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 2px;
            font-weight: 600;
          }
          .detail-value {
            font-size: 14px;
            font-weight: 500;
            color: #1f2937;
          }

          /* Table Styling */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 30px;
          }
          .items-table th {
            background-color: ${primaryColor};
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 10px 12px;
            font-size: 12px;
            text-transform: uppercase;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .items-table tr:nth-child(even) {
            background-color: #f9fafb;
          }

          /* Totals Section */
          .totals-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
          }
          .totals-table {
            width: 300px;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 8px 12px;
          }
          .totals-label {
            text-align: right;
            font-size: 13px;
            color: #555555;
          }
          .totals-value {
            text-align: right;
            font-weight: bold;
            font-size: 14px;
          }
          .total-row {
            background-color: #f3f4f6;
            border-top: 2px solid ${primaryColor};
          }
          .total-row td {
            padding: 12px;
          }
          .total-row .totals-label {
            font-size: 15px;
            color: #1f2937;
            font-weight: bold;
          }
          .total-row .totals-value {
            font-size: 18px;
            color: ${primaryColor};
            font-weight: 800;
          }

          /* Footer Notice */
          .notice {
            margin-top: 50px;
            font-size: 11px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }

          /* Custom User CSS */
          ${template.customCss || ''}
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-container">
              ${logoHtml}
            </div>
            <div class="company-details">
              <div class="company-name">${template.companyName}</div>
              <div>${template.companyAddress}</div>
              <div>Phone: ${template.companyPhone}</div>
              <div>Email: ${template.companyEmail}</div>
            </div>
          </div>

          <!-- Title & Meta -->
          <div class="invoice-meta-row">
            <div>
              <div class="invoice-title">Travel Receipt / Invoice</div>
            </div>
            <div class="meta-details">
              <div class="meta-item">
                <span class="meta-label">Date:</span>
                <span>${new Date(invoice.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Booking PNR:</span>
                <span style="font-family: monospace; font-weight: bold; font-size: 15px;">${invoice.pnr || 'N/A'}</span>
              </div>
            </div>
          </div>

          <!-- Passenger Info -->
          <div class="section">
            <div class="section-title">Passenger Information</div>
            <div class="details-grid">
              <div class="detail-block">
                <div class="detail-label">Passenger Name</div>
                <div class="detail-value">${invoice.passengerName || 'N/A'}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Issuing Carrier</div>
                <div class="detail-value">${invoice.airline || 'N/A'}</div>
              </div>
            </div>
          </div>

          <!-- Flight Info -->
          <div class="section">
            <div class="section-title">Flight Details</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Departure</th>
                  <th>Destination</th>
                  <th>Travel Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: bold; color: ${primaryColor};">${invoice.flightNumber || 'N/A'}</td>
                  <td>${invoice.departure || 'N/A'}</td>
                  <td>${invoice.destination || 'N/A'}</td>
                  <td>${invoice.travelDate || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pricing -->
          <div class="section">
            <div class="section-title">Payment Summary</div>
            <div class="totals-container">
              <table class="totals-table">
                <tr>
                  <td class="totals-label">Base Fare:</td>
                  <td class="totals-value">${formattedAmount}</td>
                </tr>
                <tr>
                  <td class="totals-label">Taxes & Fees:</td>
                  <td class="totals-value">$0.00</td>
                </tr>
                <tr class="total-row">
                  <td class="totals-label">Total Paid:</td>
                  <td class="totals-value">${formattedAmount}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Notice -->
          <div class="notice">
            Thank you for booking with ${template.companyName}. This document serves as an official receipt/invoice for your travel booking.<br>
            Please check your flight times and terminal details with the airline prior to departure.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}