import { ProductDetail } from "@/components/shop/product-detail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="container mx-auto px-4 py-16">
      <ProductDetail slug={slug} />
    </div>
  );
}
