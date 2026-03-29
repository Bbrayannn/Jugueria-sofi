# Endpoints para guardar pedidos en la base de datos
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Pedido, PedidoItem
from schemas import PedidoIn, PedidoOut

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

# POST /pedidos/ → recibe el pedido del frontend y lo guarda en MySQL
@router.post("/", response_model=PedidoOut)
def crear_pedido(data: PedidoIn, db: Session = Depends(get_db)):
    # Crea el pedido principal
    pedido = Pedido(
        direccion=data.direccion,
        notas=data.notas,
        total=data.total,
        metodo_pago=data.metodo_pago,
    )
    db.add(pedido)
    db.flush()  # Genera el id sin hacer commit todavía

    # Agrega cada ítem del pedido
    for item in data.items:
        db.add(PedidoItem(
            pedido_id=pedido.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            precio_unit=item.precio_unit,
        ))

    db.commit()       # Guarda todo en la base de datos
    db.refresh(pedido)
    return pedido

# GET /pedidos/ → lista los últimos 50 pedidos (para el admin)
@router.get("/")
def listar_pedidos(db: Session = Depends(get_db)):
    return db.query(Pedido).order_by(Pedido.creado_en.desc()).limit(50).all()