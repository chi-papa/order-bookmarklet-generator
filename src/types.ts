/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExportFormat = 'multi-rows' | 'single-row';

export interface BookmarkletConfig {
  format: ExportFormat;
  includeHeader: boolean;
  excludeEmptyRows: boolean;
  cleanProductName: boolean; // Option to strip HTML or extra tags from product names
  manufacturerCodePattern: 'parentheses-jp' | 'parentheses-en' | 'brackets' | 'none'; // （） or () or []
}

export interface ProductItem {
  id: string;
  name: string;
  itemNumber: string; // e.g. "shampoo-001 (A-55)" or "shampoo-001"
  quantity: number;
  price: number;
}

export interface RmsOrderData {
  orderDate: string;
  orderNumber: string;
  ordererName: string;
  ordererZip: string;
  ordererAddress: string;
  recipientName: string;
  recipientZip: string;
  recipientAddress: string;
  products: ProductItem[];
}
