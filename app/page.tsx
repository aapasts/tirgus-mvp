import { getCategories } from "@/lib/data";
import { CategoryTree } from "@/components/CategoryTree";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const categories = await getCategories();

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Tirgus</h1>
        <p className="text-muted-foreground text-lg">
          The best place to buy and sell everything.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Categories</h2>
        <CategoryTree categories={categories} />
      </section>
    </main>
  );
}
