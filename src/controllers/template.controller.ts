import { Response } from 'express';
import { TemplateService } from '../services/template.service';
import { AuthRequest } from '../types';

export class TemplateController {
  private templateService = new TemplateService();

  createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }
      const template = await this.templateService.createTemplate(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        data: template,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Error creating template',
      });
    }
  };

  getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }
      const templates = await this.templateService.getUserTemplates(req.user.id);
      res.status(200).json({
        status: 'success',
        data: templates,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error fetching templates',
      });
    }
  };

  getTemplateById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }
      const template = await this.templateService.getTemplate(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        data: template,
      });
    } catch (error: any) {
      res.status(404).json({
        status: 'error',
        message: error.message || 'Template not found',
      });
    }
  };

  updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }
      const updated = await this.templateService.updateTemplate(
        req.params.id,
        req.user.id,
        req.body
      );
      res.status(200).json({
        status: 'success',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Error updating template',
      });
    }
  };

  deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }
      await this.templateService.deleteTemplate(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Template deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Error deleting template',
      });
    }
  };
}
