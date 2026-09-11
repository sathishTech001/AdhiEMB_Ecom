/**
 * Matches backend DownloadTokenDTO.java
 * One token = one purchased ProductFileData record.
 */
export interface DownloadToken {
  id: number;
  token: string;
  userId: number;
  orderId: number;
  orderNumber: string;
  productId: number;
  productTitle: string;
  fileId: number | null;
  fileName: string;
  fileFormat: string;       // e.g. "DST", "PES", "JEF"
  machineInfo: string | null; // e.g. "Bernina 14x8" — shown in vault
  downloadCount: number;
  maxDownloads: number | null; // null = lifetime unlimited
  expiresAt: string | null;    // null = no expiry, lifetime access
}

/**
 * Matches backend UserDownloadDTO.java
 * One UserDownload groups all tokens for a product per order.
 * tokens[] contains one entry per purchased machine file.
 */
export interface UserDownload {
  productId: number;
  productTitle: string;
  productSlug: string;
  primaryImageUrl: string | null;
  orderNumber: string;
  purchasedAt: string;    // ISO LocalDateTime string
  tokens: DownloadToken[];
}
