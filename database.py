# Este archivo maneja la conexión entre Python y MySQL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

# Carga las variables del archivo .env
load_dotenv()

# Arma la URL de conexión con los datos del .env
DB_URL = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

# Crea el motor de base de datos
engine = create_engine(DB_URL)

# Crea la fábrica de sesiones (una sesión = una "conversación" con la BD)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para todos los modelos
class Base(DeclarativeBase):
    pass

# Función que abre y cierra sesiones automáticamente
def get_db():
    db = SessionLocal()
    try:
        yield db      # Entrega la sesión al endpoint que la necesite
    finally:
        db.close()    # Siempre cierra la sesión al terminar