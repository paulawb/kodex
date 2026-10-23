from pydantic import BaseModel, Field

DEFAULT_TEMPLATE = (
    "Hola KØDEX 👋, soy {nombre} de {ciudad}. Quiero pedir estas prendas:\n\n{items}\n\n*TOTAL: {total}*"
)
DEFAULT_ITEM_TEMPLATE = "{n}. *{nombre}* ({ref}) {descripcion}\n   Color: {color} | Talla: {talla} | Cantidad: {cantidad} | {subtotal}"
HEX = r"^#[0-9a-fA-F]{6}$"


class Color(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    hex: str = Field(pattern=HEX)  # muestra del selector
    available: bool = True
    front_image: str | None = Field(default=None, max_length=300)
    back_image: str | None = Field(default=None, max_length=300)


class ProductIn(BaseModel):
    ref: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=200)
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
    item_template: str = Field(default=DEFAULT_ITEM_TEMPLATE, min_length=1, max_length=500)


class LoginIn(BaseModel):
    password: str


def storefront_view(product: "Product") -> "Product | None":
    """Solo se muestran colores disponibles con foto frontal; sin ninguno, la prenda no aparece."""
    colors = [c for c in product.colors if c.available and c.front_image]
    if not colors:
        return None
    return product.model_copy(update={"colors": colors})
