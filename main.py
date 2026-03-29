# Punto de entrada: aquí arranca todo el servidor FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import productos, pedidos

# Crea las tablas en MySQL si no existen todavía
Base.metadata.create_all(bind=engine)

# Crea la aplicación FastAPI
app = FastAPI(title="Juguería Sofi API", version="1.0")

# CORS: permite que el frontend (en otro puerto) hable con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # En producción pon solo tu dominio
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra las rutas de productos y pedidos
app.include_router(productos.router)
app.include_router(pedidos.router)

# Ruta de prueba para verificar que el servidor está vivo
@app.get("/")
def inicio():
    return {"mensaje": "🍹 Juguería Sofi API funcionando"}