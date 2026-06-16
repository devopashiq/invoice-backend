import TemplateModel from '../models/Template';
import { ITemplate } from '../types';

export class TemplateRepository {
  async findById(id: string, userId: string): Promise<ITemplate | null> {
    return TemplateModel.findOne({ _id: id, userId }).exec();
  }

  async findByUserId(userId: string): Promise<ITemplate[]> {
    return TemplateModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async create(templateData: Partial<ITemplate>): Promise<ITemplate> {
    const template = new TemplateModel(templateData);
    return template.save();
  }

  async update(id: string, userId: string, updateData: Partial<ITemplate>): Promise<ITemplate | null> {
    return TemplateModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async delete(id: string, userId: string): Promise<ITemplate | null> {
    return TemplateModel.findOneAndDelete({ _id: id, userId }).exec();
  }
}
