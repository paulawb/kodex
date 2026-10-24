import { ProductDetail } from "@/components/shop/product-detail";

export default function ProductPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <ProductDetail slug={params.slug} />
    </div>
  );
}
