# Endpoints para consultar los jugos del menú
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Producto
from schemas import ProductoOut
from typing import List

# Prefijo /productos → todas las rutas empiezan con /productos
router = APIRouter(prefix="/productos", tags=["productos"])

# GET /productos/ → devuelve todos los jugos activos
@router.get("/", response_model=List[ProductoOut])
def listar_productos(db: Session = Depends(get_db)):
    return db.query(Producto).filter(Producto.activo == True).all()

# GET /productos/naturales → devuelve solo los de esa categoría
@router.get("/{categoria}", response_model=List[ProductoOut])
def por_categoria(categoria: str, db: Session = Depends(get_db)):
    return db.query(Producto).filter(
        Producto.categoria == categoria,
        Producto.activo == True
    ).all()
