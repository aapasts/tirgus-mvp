import { supabase } from './supabase'

export type Category = {
    id: string
    name: string
    slug: string
    parent_id: string | null
    icon: string | null
}

export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return data as Category[]
}

export type Listing = {
    id: string
    user_id: string
    category_id: string
    title: string
    description: string | null
    price: number | null
    currency: string
    location: string | null
    status: string
    views_count: number
    created_at: string
    updated_at: string
}

export async function getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching category:', error)
        return null
    }

    return data as Category
}

export async function getListingsByCategory(categoryId: string) {
    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching listings:', error)
        return []
    }

    return data as Listing[]
}
