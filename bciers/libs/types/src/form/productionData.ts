export interface Product {
  id: number;
  name: string;
}

export interface ProductData {
  product_id: number;
  product_name: string;
  unit: string;
  [key: string]: any;
}
