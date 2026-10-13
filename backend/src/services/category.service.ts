import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { CategoryDto } from '../types/index.js';

export class CategoryService {
  async getAllCategories(): Promise<CategoryDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        'SELECT id, name, description, icon_url FROM categories ORDER BY name ASC'
      );
      return res.rows.map(this.mapCategory);
    }
    return memoryDb.categories.map(this.mapCategory);
  }

  async getCategoryById(id: string): Promise<CategoryDto> {
    if (isPostgres()) {
      const res = await db.query(
        'SELECT id, name, description, icon_url FROM categories WHERE id = $1',
        [id]
      );
      if (res.rows.length === 0) throw new BusinessException('CATEGORY_NOT_FOUND');
      return this.mapCategory(res.rows[0]);
    }
    const cat = memoryDb.categories.find((c) => c.id === id);
    if (!cat) throw new BusinessException('CATEGORY_NOT_FOUND');
    return this.mapCategory(cat);
  }

  private mapCategory(row: any): CategoryDto {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      iconUrl: row.icon_url,
    };
  }
}

export const categoryService = new CategoryService();
