export interface Product {
  product_id: number;
  product_name: string;
}
export interface ProductData extends Product {
  unit: string;
  [key: string]: any;
}
