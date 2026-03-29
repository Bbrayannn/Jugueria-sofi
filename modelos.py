# Cada clase aquí representa una tabla en MySQL
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# Tabla "productos"
class Producto(Base):
    __tablename__ = "productos"
    id          = Column(Integer, primary_key=True, index=True)
    nombre      = Column(String(200), nullable=False)
    descripcion = Column(String(500))
    precio      = Column(Float, nullable=False)
    categoria   = Column(Enum("naturales", "batidos", "especiales"))
    emoji       = Column(String(10))
    activo      = Column(Boolean, default=True)
    creado_en   = Column(DateTime, default=datetime.utcnow)

# Tabla "pedidos"
class Pedido(Base):
    __tablename__ = "pedidos"
    id          = Column(Integer, primary_key=True, index=True)
    direccion   = Column(String(500), nullable=False)
    notas       = Column(Text)
    total       = Column(Float, nullable=False)
    estado      = Column(Enum("pendiente","confirmado","enviado","entregado"), default="pendiente")
    metodo_pago = Column(Enum("nequi", "bancolombia"), default="nequi")
    creado_en   = Column(DateTime, default=datetime.utcnow)
    # Relación: un pedido tiene varios ítems
    items       = relationship("PedidoItem", back_populates="pedido")

# Tabla "pedido_items"
class PedidoItem(Base):
    __tablename__ = "pedido_items"
    id          = Column(Integer, primary_key=True, index=True)
    pedido_id   = Column(Integer, ForeignKey("pedidos.id"))
    producto_id = Column(Integer, ForeignKey("productos.id"))
    cantidad    = Column(Integer, nullable=False)
    precio_unit = Column(Float, nullable=False)
    pedido      = relationship("Pedido", back_populates="items")
    producto    = relationship("Producto")