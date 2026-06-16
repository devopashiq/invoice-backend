import fs from 'fs';
import { createWorker } from 'tesseract.js';
const pdfParse = require('pdf-parse');

export interface ExtractedInvoiceData {
  passengerName: string | null;
  pnr: string | null;
  airline: string | null;
  flightNumber: string | null;
  departure: string | null;
  destination: string | null;
  travelDate: string | null;
  amount: number | null;
  currency: string | null;
  rawOcrText: string;
}

export class OcrService {
  async extractText(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      try {
        const parsed = await pdfParse(dataBuffer);
        return parsed.text || '';
      } catch (error) {
        console.error('Error parsing PDF text, falling back to empty string:', error);
        return '';
      }
    } else {
      // It's an image (png, jpg, jpeg)
      const worker = await createWorker('eng');
      try {
        const ret = await worker.recognize(filePath);
        return ret.data.text || '';
      } finally {
        await worker.terminate();
      }
    }
  }

  parseInvoiceFields(text: string): ExtractedInvoiceData {
    let passengerName: string | null = null;
    let pnr: string | null = null;
    let airline: string | null = null;
    let flightNumber: string | null = null;
    let departure: string | null = null;
    let destination: string | null = null;
    let travelDate: string | null = null;
    let amount: number | null = null;
    let currency: string | null = null;

    // 1. Airline list check & Regex matching
    const airlinesList = [
      'Delta', 'United', 'Emirates', 'Lufthansa', 'British Airways', 'Air India', 
      'Indigo', 'Ryanair', 'Singapore Airlines', 'Qatar Airways', 'American Airlines', 
      'Air France', 'KLM', 'EasyJet', 'Etihad', 'Turkish Airlines', 'Qantas', 'JetBlue'
    ];
    for (const air of airlinesList) {
      const regex = new RegExp(`\\b${air}\\b`, 'i');
      if (regex.test(text)) {
        airline = air;
        break;
      }
    }
    if (!airline) {
      const airlineMatch = text.match(/(?:airline|carrier)\s*:\s*([a-zA-Z\s]+)/i);
      if (airlineMatch && airlineMatch[1]) {
        airline = airlineMatch[1].trim();
      }
    }

    // 2. Passenger Name
    const nameMatch = text.match(/(?:passenger|pax|name|passenger\s*name)\s*:\s*([a-zA-Z\s\/]+)/i);
    if (nameMatch && nameMatch[1]) {
      const parsedName = nameMatch[1].trim().replace(/\s+/g, ' ');
      // Filter out common labels if captured
      if (parsedName.length > 2 && !/date|flight|pnr|booking|ticket/i.test(parsedName)) {
        passengerName = parsedName;
      }
    }

    // 3. PNR (usually 6 character alphanumeric record locator)
    const pnrMatch = text.match(/(?:pnr|record\s*locator|booking\s*ref|booking\s*reference|booking\s*code)\s*:\s*([a-zA-Z0-9]{6})\b/i);
    if (pnrMatch && pnrMatch[1]) {
      pnr = pnrMatch[1].trim().toUpperCase();
    } else {
      // General search for a standalone 6-char alphanumeric string that looks like a PNR
      const generalPnrMatch = text.match(/\b([A-Z0-9]{6})\b/);
      if (generalPnrMatch && generalPnrMatch[1] && !/^[0-9]+$/.test(generalPnrMatch[1]) && !/^[A-Z]+$/.test(generalPnrMatch[1])) {
        // Must contain both letters and numbers to reduce false positives
        pnr = generalPnrMatch[1].trim();
      }
    }

    // 4. Flight Number (e.g. DL123, EK 456, etc.)
    const flightMatch = text.match(/(?:flight|flight\s*no|flight\s*number)\s*:\s*([a-zA-Z0-9\s]+)/i);
    if (flightMatch && flightMatch[1]) {
      flightNumber = flightMatch[1].trim().toUpperCase().replace(/\s+/g, '');
    } else {
      // Look for code-like strings (2 letters followed by 3 or 4 digits)
      const codeMatch = text.match(/\b([A-Z]{2})\s*([0-9]{3,4})\b/i);
      if (codeMatch && codeMatch[1] && codeMatch[2]) {
        flightNumber = `${codeMatch[1].toUpperCase()}${codeMatch[2]}`;
      }
    }

    // 5. Departure and Destination
    // Common departure labels: "From:", "Departure:", "Origin:"
    const fromMatch = text.match(/(?:from|origin|departure\s*city|departure\s*airport)\s*:\s*([a-zA-Z\s\(\)]+)/i);
    if (fromMatch && fromMatch[1]) {
      const cleaned = fromMatch[1].trim().split('\n')[0];
      if (cleaned.length > 2 && !/date|flight|passenger/i.test(cleaned)) {
        departure = cleaned.replace(/\s+/g, ' ');
      }
    }
    // Common destination labels: "To:", "Destination:", "Arrival:"
    const toMatch = text.match(/(?:to|destination|arrival\s*city|arrival\s*airport)\s*:\s*([a-zA-Z\s\(\)]+)/i);
    if (toMatch && toMatch[1]) {
      const cleaned = toMatch[1].trim().split('\n')[0];
      if (cleaned.length > 2 && !/date|flight|passenger/i.test(cleaned)) {
        destination = cleaned.replace(/\s+/g, ' ');
      }
    }

    // 6. Travel Date
    const dateMatch = text.match(/(?:travel\s*date|departure\s*date|date|flight\s*date)\s*:\s*([0-9]{2,4}[-\/][0-9]{2}[-\/][0-9]{2,4}|[0-9]{1,2}\s+[a-zA-Z]{3,9}\s+[0-9]{4}|[a-zA-Z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})/i);
    if (dateMatch && dateMatch[1]) {
      travelDate = dateMatch[1].trim();
    }

    // 7. Amount and Currency
    // Look for fields like "Total:", "Total Fare:", "Amount:"
    const amountMatch = text.match(/(?:total|amount|fare|total\s*fare|price)\s*:\s*(?:([\$€£₹])|([a-zA-Z]{3}))?\s*([\d,]+\.?\d*)/i);
    if (amountMatch) {
      if (amountMatch[3]) {
        const parsedVal = parseFloat(amountMatch[3].replace(/,/g, ''));
        if (!isNaN(parsedVal)) {
          amount = parsedVal;
        }
      }
      
      const currencySymbol = amountMatch[1] || amountMatch[2];
      if (currencySymbol) {
        if (currencySymbol === '$') currency = 'USD';
        else if (currencySymbol === '€') currency = 'EUR';
        else if (currencySymbol === '£') currency = 'GBP';
        else if (currencySymbol === '₹') currency = 'INR';
        else currency = currencySymbol.toUpperCase();
      }
    }

    // Secondary currency detection if not found in total
    if (!currency) {
      const currencyRegex = /\b(USD|EUR|GBP|INR|CAD|AUD)\b/i;
      const curMatch = text.match(currencyRegex);
      if (curMatch) {
        currency = curMatch[1].toUpperCase();
      } else if (text.includes('$')) {
        currency = 'USD';
      } else if (text.includes('€')) {
        currency = 'EUR';
      } else if (text.includes('£')) {
        currency = 'GBP';
      } else if (text.includes('₹')) {
        currency = 'INR';
      }
    }

    return {
      passengerName,
      pnr,
      airline,
      flightNumber,
      departure,
      destination,
      travelDate,
      amount,
      currency,
      rawOcrText: text,
    };
  }
}
