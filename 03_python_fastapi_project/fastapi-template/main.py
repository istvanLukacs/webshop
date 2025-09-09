from contextlib import asynccontextmanager
from typing import Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import Product, create_tables, get_db


class ProductDTO(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

    class Config:
        from_attributes = True


class CartItemRequest(BaseModel):
    product_id: int
    session_id: str


class CartItemResponse(BaseModel):
    product_id: int
    quantity: int
    product: ProductDTO


class ProductCreate(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    stock: Optional[int] = None


# In-memory cart storage: session_id -> {product_id: quantity}
carts: Dict[str, Dict[int, int]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/products/", response_model=List[ProductDTO])
async def get_all_products(db: AsyncSession = Depends(get_db)):
    """Get all products"""
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products


@app.get("/products/{product_id}", response_model=ProductDTO)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific product by ID"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product


@app.post("/products/", response_model=ProductDTO)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    """Create a new product"""
    db_product = Product(
        name=product.name,
        price=product.price,
        description=product.description,
        stock=product.stock
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@app.put("/products/{product_id}", response_model=ProductDTO)
async def update_product(
    product_id: int, 
    product_update: ProductUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update an existing product"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update only provided fields
    for field, value in product_update.model_dump(exclude_unset=True).items():
        setattr(db_product, field, value)
    
    await db.commit()
    await db.refresh(db_product)
    return db_product


@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a product"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(db_product)
    await db.commit()
    return {"message": "Product deleted successfully"}


@app.post("/cart/add")
async def add_to_cart(cart_item: CartItemRequest, db: AsyncSession = Depends(get_db)):
    """Add a product to cart"""
    # Check if product exists and has sufficient stock
    result = await db.execute(select(Product).filter(Product.id == cart_item.product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get current cart for this session
    session_cart = carts.get(cart_item.session_id, {})
    current_cart_quantity = session_cart.get(cart_item.product_id, 0)
    
    # Check if there's enough stock
    if current_cart_quantity >= product.stock:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Initialize session cart if it doesn't exist
    if cart_item.session_id not in carts:
        carts[cart_item.session_id] = {}
    
    # Add to cart
    carts[cart_item.session_id][cart_item.product_id] = current_cart_quantity + 1
    
    return {"message": "Product added to cart successfully"}


@app.get("/cart/{session_id}", response_model=List[CartItemResponse])
async def get_cart(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get cart items for a session"""
    session_cart = carts.get(session_id, {})
    cart_items = []
    
    for product_id, quantity in session_cart.items():
        # Get product details
        result = await db.execute(select(Product).filter(Product.id == product_id))
        product = result.scalar_one_or_none()
        
        if product:  # Product might have been deleted
            cart_items.append(CartItemResponse(
                product_id=product_id,
                quantity=quantity,
                product=ProductDTO.model_validate(product)
            ))
    
    return cart_items


@app.delete("/cart/{session_id}/{product_id}")
async def remove_from_cart(session_id: str, product_id: int):
    """Remove a product from cart"""
    if session_id in carts and product_id in carts[session_id]:
        del carts[session_id][product_id]
        # Clean up empty session cart
        if not carts[session_id]:
            del carts[session_id]
        return {"message": "Product removed from cart successfully"}
    
    raise HTTPException(status_code=404, detail="Product not found in cart")


@app.get("/cart/{session_id}/available-stock/{product_id}")
async def get_available_stock(session_id: str, product_id: int, db: AsyncSession = Depends(get_db)):
    """Get available stock for a product (total stock - cart quantity)"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    session_cart = carts.get(session_id, {})
    cart_quantity = session_cart.get(product_id, 0)
    available_stock = product.stock - cart_quantity
    
    return {"available_stock": max(0, available_stock)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
