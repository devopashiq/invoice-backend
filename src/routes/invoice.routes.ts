import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/fileUpload';
import { validateRequest } from '../middleware/validateRequest';
import { updateInvoiceSchema } from '../dtos/invoice.dto';

const router = Router();
const invoiceController = new InvoiceController();

// All routes require authentication
router.use(authMiddleware);

router.post('/upload', uploadMiddleware.single('file'), invoiceController.uploadInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', validateRequest(updateInvoiceSchema), invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);
router.post('/:id/generate-pdf', invoiceController.generatePdf);
router.get('/:id/download-pdf', invoiceController.downloadPdf);

export default router;
