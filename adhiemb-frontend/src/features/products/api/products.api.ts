import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse, PagedResponse } from '@/types/api.types';
import {
  Product,
  ProductDetail,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  ProductApprovalData,
} from '../types/product.types';

export const productsApi = {
  getAll: async (params?: ProductFilters): Promise<ApiResponse<PagedResponse<Product>>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.PRODUCTS, { params });
    return data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<ProductDetail>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/slug/${slug}`);
    return data;
  },

  getById: async (id: string | number): Promise<ApiResponse<ProductDetail>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
    return data;
  },

  create: async (productData: CreateProductData): Promise<ApiResponse<ProductDetail>> => {
    const imageUrls = productData.images
      ? productData.images.map((img) => (typeof img === 'string' ? img : (img.imageUrl || img.url || '')))
      : [];
    const formattedFiles = productData.files?.map((f) => ({
      fileName: f.fileName || f.originalFileName || '',
      originalFileName: f.originalFileName || f.fileName || '',
      fileUrl: f.fileUrl || f.filePath || '#',
      filePath: f.filePath || f.fileUrl || '#',
      storageKey: f.storageKey || f.filePath || f.fileUrl || f.fileName || '',
      fileFormat: f.format || f.fileFormat || 'DST',
      fileSize: f.fileSize || f.fileSizeBytes || 0,
      fileSizeBytes: f.fileSizeBytes || f.fileSize || 0,
      machineInfo: f.machineInfo || '',
      price: f.price !== undefined && f.price !== null && (f.price as any) !== '' && !isNaN(Number(f.price))
        ? Number(f.price)
        : 25,
    })) || [];
    const payload = {
      ...productData,
      imageUrls: (productData as any).imageUrls || imageUrls,
      files: formattedFiles,
    };
    const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS, payload);
    return data;
  },

  update: async (id: string | number, productData: UpdateProductData): Promise<ApiResponse<ProductDetail>> => {
    const imageUrls = productData.images
      ? productData.images.map((img) => (typeof img === 'string' ? img : (img.imageUrl || img.url || '')))
      : undefined;
    const formattedFiles = productData.files?.map((f) => ({
      fileName: f.fileName || f.originalFileName || '',
      originalFileName: f.originalFileName || f.fileName || '',
      fileUrl: f.fileUrl || f.filePath || '#',
      filePath: f.filePath || f.fileUrl || '#',
      storageKey: f.storageKey || f.filePath || f.fileUrl || f.fileName || '',
      fileFormat: f.format || f.fileFormat || 'DST',
      fileSize: f.fileSize || f.fileSizeBytes || 0,
      fileSizeBytes: f.fileSizeBytes || f.fileSize || 0,
      machineInfo: f.machineInfo || '',
      price: f.price !== undefined && f.price !== null && (f.price as any) !== '' && !isNaN(Number(f.price))
        ? Number(f.price)
        : 25,
    }));
    const payload = {
      ...productData,
      ...(imageUrls ? { imageUrls } : {}),
      ...(formattedFiles ? { files: formattedFiles } : {}),
    };
    const { data } = await apiClient.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, payload);
    return data;
  },

  submitForApproval: async (id: string | number): Promise<ApiResponse<ProductDetail>> => {
    const { data } = await apiClient.post(`${API_ENDPOINTS.PRODUCTS}/${id}/submit`);
    return data;
  },

  approveOrReject: async (id: string | number, approvalData: ProductApprovalData): Promise<ApiResponse<ProductDetail>> => {
    const { data } = await apiClient.post(`${API_ENDPOINTS.PRODUCTS}/${id}/approve`, approvalData);
    return data;
  },

  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
    return data;
  },

  uploadFile: async (formData: FormData): Promise<ApiResponse<{ url: string; fileName: string; fileSize?: number; format?: string }>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.FILES, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  searchPublic: async (params?: ProductFilters): Promise<ApiResponse<PagedResponse<Product>>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.PUBLIC_PRODUCTS, { params });
    return data;
  },

  getPublicBySlug: async (slug: string): Promise<ApiResponse<ProductDetail>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.PUBLIC_PRODUCTS}/slug/${slug}`);
    return data;
  },

  getFeatured: async (): Promise<ApiResponse<Product[]>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.PUBLIC_PRODUCTS}/featured`);
    return data;
  },
};
