import Link from "next/link"
import { Category } from "@/lib/data"
import { cn } from "@/lib/utils"

interface CategoryTreeProps {
    categories: Category[]
}

export function CategoryTree({ categories }: CategoryTreeProps) {
    // Separate main categories and subcategories
    const mainCategories = categories.filter((c) => c.parent_id === null)
    const subCategories = categories.filter((c) => c.parent_id !== null)

    // Helper to get children for a parent
    const getChildren = (parentId: string) => {
        return subCategories.filter((c) => c.parent_id === parentId)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainCategories.map((mainCategory) => (
                <div key={mainCategory.id} className="space-y-2">
                    <h3 className="font-bold text-lg text-primary hover:underline">
                        <Link href={`/category/${mainCategory.slug}`}>
                            {mainCategory.name}
                        </Link>
                    </h3>
                    <ul className="space-y-1">
                        {getChildren(mainCategory.id).map((child) => (
                            <li key={child.id} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <Link href={`/category/${child.slug}`}>
                                    {child.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}
