import { Hero } from "@/components/home/hero";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { Lookbook } from "@/components/home/lookbook";
import { Newsletter } from "@/components/home/newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollection />
      <Lookbook />
      <Newsletter />
    </>
  );
}
