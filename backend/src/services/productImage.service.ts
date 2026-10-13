import 'multer';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { ProductImageDto } from '../types/index.js';
import { productService } from './product.service.js';
import { ENV } from '../config/env.js';

export class ProductImageService {
  async getProductImages(productId: string): Promise<ProductImageDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order ASC',
        [productId]
      );
      return res.rows.map(this.mapImage);
    }
    return memoryDb.product_images
      .filter((i) => i.product_id === productId)
      .map(this.mapImage);
  }

  async uploadProductImage(
    sellerId: string,
    productId: string,
    file?: Express.Multer.File,
    isAdmin = false
  ): Promise<ProductImageDto> {
    const prod = await productService.getProductById(productId);
    if (!isAdmin && prod.sellerId !== sellerId) {
      throw new BusinessException('PRODUCT_ACCESS_DENIED');
    }

    if (!file) {
      throw new BusinessException('INVALID_PRODUCT_IMAGE', 'No image file provided');
    }

    let imageUrl = '';
    if (ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY) {
      try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'agrimarket/products' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          (stream as any).end(file.buffer);
        });
        imageUrl = uploadResult.secure_url;
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to data URL:', err);
        imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    } else {
      imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    const currentImages = await this.getProductImages(productId);
    const isFirst = currentImages.length === 0;
    const nextOrder = currentImages.length + 1;
    const imageId = uuidv4();
    const now = new Date();

    if (isPostgres()) {
      await db.query(
        `INSERT INTO product_images (
          id, product_id, image_url, is_primary, display_order, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $6)`,
        [imageId, productId, imageUrl, isFirst, nextOrder, now]
      );
    } else {
      memoryDb.product_images.push({
        id: imageId,
        product_id: productId,
        image_url: imageUrl,
        is_primary: isFirst,
        display_order: nextOrder,
        created_date: now,
        last_modified_date: now,
      });
    }

    return {
      id: imageId,
      productId,
      imageUrl,
      isPrimary: isFirst,
      displayOrder: nextOrder,
    };
  }

  async setPrimaryImage(
    sellerId: string,
    productId: string,
    imageId: string,
    isAdmin = false
  ): Promise<void> {
    const prod = await productService.getProductById(productId);
    if (!isAdmin && prod.sellerId !== sellerId) {
      throw new BusinessException('PRODUCT_ACCESS_DENIED');
    }

    if (isPostgres()) {
      await db.query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [productId]);
      const res = await db.query(
        'UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2',
        [imageId, productId]
      );
      if (res.rowCount === 0) throw new BusinessException('PRODUCT_IMAGE_NOT_FOUND');
    } else {
      memoryDb.product_images.filter((i) => i.product_id === productId).forEach((i) => (i.is_primary = false));
      const img = memoryDb.product_images.find((i) => i.id === imageId && i.product_id === productId);
      if (!img) throw new BusinessException('PRODUCT_IMAGE_NOT_FOUND');
      img.is_primary = true;
    }
  }

  async deleteProductImage(
    sellerId: string,
    productId: string,
    imageId: string,
    isAdmin = false
  ): Promise<void> {
    const prod = await productService.getProductById(productId);
    if (!isAdmin && prod.sellerId !== sellerId) {
      throw new BusinessException('PRODUCT_ACCESS_DENIED');
    }

    const images = await this.getProductImages(productId);
    if (images.length <= 1) {
      throw new BusinessException(
        'PRODUCT_IMAGE_DELETE_FAILED',
        'Catalog Rule Violation: Cannot delete product image. Listings must maintain at least one valid produce photo.'
      );
    }

    const target = images.find((i) => i.id === imageId);
    if (!target) throw new BusinessException('PRODUCT_IMAGE_NOT_FOUND');

    if (isPostgres()) {
      await db.query('DELETE FROM product_images WHERE id = $1 AND product_id = $2', [imageId, productId]);
      if (target.isPrimary) {
        // Set first remaining image as primary
        await db.query(
          `UPDATE product_images SET is_primary = true
           WHERE id = (SELECT id FROM product_images WHERE product_id = $1 ORDER BY display_order ASC LIMIT 1)`,
          [productId]
        );
      }
    } else {
      memoryDb.product_images = memoryDb.product_images.filter((i) => i.id !== imageId);
      if (target.isPrimary) {
        const remaining = memoryDb.product_images.filter((i) => i.product_id === productId);
        if (remaining.length > 0) remaining[0].is_primary = true;
      }
    }
  }

  async updateImageOrder(
    sellerId: string,
    productId: string,
    imageId: string,
    order: number,
    isAdmin = false
  ): Promise<void> {
    const prod = await productService.getProductById(productId);
    if (!isAdmin && prod.sellerId !== sellerId) {
      throw new BusinessException('PRODUCT_ACCESS_DENIED');
    }

    if (isPostgres()) {
      await db.query('UPDATE product_images SET display_order = $1 WHERE id = $2 AND product_id = $3', [
        order,
        imageId,
        productId,
      ]);
    } else {
      const img = memoryDb.product_images.find((i) => i.id === imageId && i.product_id === productId);
      if (!img) throw new BusinessException('PRODUCT_IMAGE_NOT_FOUND');
      img.display_order = order;
    }
  }

  private mapImage(row: any): ProductImageDto {
    return {
      id: row.id,
      productId: row.product_id,
      imageUrl: row.image_url,
      isPrimary: !!row.is_primary,
      displayOrder: row.display_order,
    };
  }
}

export const productImageService = new ProductImageService();
