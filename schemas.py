# Pydantic valida que los datos que llegan tengan el formato correcto
from pydantic import BaseModel
from typing import List, Optional

# Cómo se ve un producto cuando la API lo devuelve
class ProductoOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    categoria: str
    emoji: Optional[str]
    class Config:
        from_attributes = True  # Permite convertir desde objetos SQLAlchemy

# Cómo se ve un ítem cuando llega en un pedido
class ItemIn(BaseModel):
    producto_id: int
    cantidad: int
    precio_unit: float

# Cómo se ve un pedido cuando llega del frontend
class PedidoIn(BaseModel):
    direccion: str
    notas: Optional[str] = None
    total: float
    metodo_pago: str = "nequi"
    items: List[ItemIn]            # Lista de productos del pedido

# Cómo se ve un pedido cuando la API lo devuelve
class PedidoOut(BaseModel):
    id: int
    direccion: str
    total: float
    estado: str
    class Config:
        from_attributes = True