export interface Product {
  id: number;
  name: string;
}
export interface ProductData extends Product {
  unit: string;
  [key: string]: any;
}
