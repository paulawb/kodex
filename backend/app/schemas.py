from typing import Literal

from pydantic import BaseModel, Field

DEFAULT_TEMPLATE = (
    "*Nuevo pedido KØDEX*\nNombre: {nombre}\nCiudad: {ciudad}\n\n{items}\n\n*TOTAL: {total}*"
)
HEX = r"^#[0-9a-fA-F]{6}$"


class Color(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    hex: str = Field(pattern=HEX)  # tela
    ink: str = Field(pattern=HEX)  # gráfico tribal
    front_image: str | None = Field(default=None, max_length=300)  # foto real (opcional)
    back_image: str | None = Field(default=None, max_length=300)


class ProductIn(BaseModel):
    ref: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=80)
    type: Literal["tee", "hoodie", "cap"] = "tee"
    graphic: Literal["sigil", "fang", "eye"] = "sigil"
    price: int = Field(ge=0)
    colors: list[Color] = Field(min_length=1)
    sizes: list[str] = Field(min_length=1)
    active: bool = True


class Product(ProductIn):
    id: int


class SettingsIn(BaseModel):
    whatsapp_number: str = Field(pattern=r"^\d{8,15}$")
    currency: str = Field(default="COP", max_length=5)
    message_template: str = Field(default=DEFAULT_TEMPLATE, min_length=1, max_length=2000)


class LoginIn(BaseModel):
    password: str
