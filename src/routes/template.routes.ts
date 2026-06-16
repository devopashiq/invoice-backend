import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';
import { createTemplateSchema, updateTemplateSchema } from '../dtos/template.dto';

const router = Router();
const templateController = new TemplateController();

// All routes require authentication
router.use(authMiddleware);

router.post('/', validateRequest(createTemplateSchema), templateController.createTemplate);
router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);
router.put('/:id', validateRequest(updateTemplateSchema), templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

export default router;
