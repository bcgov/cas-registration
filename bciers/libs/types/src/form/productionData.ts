export interface Product {
  id: number;
  name: string;
  unit: string;
}

export interface ProductData {
  product_id: number;
  product_name: string;
  [key: string]: any;
}
