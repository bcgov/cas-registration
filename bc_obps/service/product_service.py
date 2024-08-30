from typing import List, Dict, Any
from registration.models import RegulatedProduct


class ProductService:
    @classmethod
    def get_all_regulated_products(cls) -> List[Dict[str, Any]]:
        products = RegulatedProduct.objects.all().values("id", "name")
        return [dict(product) for product in products]
