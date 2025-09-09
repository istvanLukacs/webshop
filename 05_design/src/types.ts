export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  stock: number;
}

export interface ProductCreate {
  name: string;
  price: number;
  description: string | null;
  stock: number;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  description?: string | null;
  stock?: number;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  product: Product;
}

export interface CartItemRequest {
  product_id: number;
  session_id: string;
}
