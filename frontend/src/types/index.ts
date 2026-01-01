
export type IdentifierType = 'SKU' | 'EAN' | 'UPC' | 'ASIN' | 'MPN';

export interface Product {
  id: string;
  name: string;
  identifierType: IdentifierType;
  identifierValue: string;
}

export interface Source {
  id: string;
  productId: string;
  storeName: string;
  url: string;
  cssSelector: string;
}

export interface PriceRecord {
  timestamp: string;
  price: number;
  sourceId: string;
}

export enum Tab {
  Inventory = 'inventory',
  Dashboard = 'dashboard'
}
