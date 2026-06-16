import { TemplateRepository } from '../repositories/template.repository';
import { ITemplate } from '../types';
import { CreateTemplateDTO, UpdateTemplateDTO } from '../dtos/template.dto';

export class TemplateService {
  private templateRepository = new TemplateRepository();

  async createTemplate(userId: string, data: CreateTemplateDTO): Promise<ITemplate> {
    return this.templateRepository.create({
      userId: userId as any,
      ...data,
    });
  }

  async getTemplate(id: string, userId: string): Promise<ITemplate> {
    const template = await this.templateRepository.findById(id, userId);
    if (!template) {
      throw new Error('Template not found or unauthorized');
    }
    return template;
  }

  async getUserTemplates(userId: string): Promise<ITemplate[]> {
    return this.templateRepository.findByUserId(userId);
  }

  async updateTemplate(id: string, userId: string, data: UpdateTemplateDTO): Promise<ITemplate> {
    const template = await this.templateRepository.update(id, userId, data);
    if (!template) {
      throw new Error('Template not found or unauthorized');
    }
    return template;
  }

  async deleteTemplate(id: string, userId: string): Promise<void> {
    const template = await this.templateRepository.delete(id, userId);
    if (!template) {
      throw new Error('Template not found or unauthorized');
    }
  }
}
