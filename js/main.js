// Main homepage logic
document.addEventListener('DOMContentLoaded', async () => {
    // Initial UI count
    cart.updateCountUI();

    // Fetch Featured Categories
    try {
        const { data: categories, error } = await supabaseClient
            .from('categories')
            .select('*')
            .limit(3);
        
        if (categories && categories.length > 0) {
            const container = document.getElementById('featured-categories');
            if (container) {
                container.innerHTML = categories.map(cat => renderCard(cat, 'category')).join('');
            }
        } else {
            // Placeholder data for demo if DB is empty
            const demoCats = [
                { id: 1, name: "Handmade Pottery", description: "Beautiful ceramic pieces", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400" },
                { id: 2, name: "Macrame Art", description: "Hand-woven wall hangings", image: "https://images.unsplash.com/photo-1528484461744-8da0038ed351?auto=format&fit=crop&q=80&w=400" },
                { id: 3, name: "Watercolour Paintings", description: "Original art pieces", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400" }
            ];
            const container = document.getElementById('featured-categories');
            if (container) {
                container.innerHTML = demoCats.map(cat => renderCard(cat, 'category')).join('');
            }
        }
    } catch (e) {
        console.error("Error fetching categories:", e);
    }

    // Fetch New Arrivals
    try {
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(4);
        
        if (products && products.length > 0) {
            const container = document.getElementById('new-arrivals');
            if (container) {
                container.innerHTML = products.map(prod => renderCard(prod, 'product')).join('');
            }
        } else {
            // Placeholder data for demo
            const demoProds = [
                { id: 1, name: "Ceramic Mug", price: 25, image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=400" },
                { id: 2, name: "Boho Wall Hanging", price: 45, image_url: "https://images.unsplash.com/photo-1544413647-b5104439950a?auto=format&fit=crop&q=80&w=400" },
                { id: 3, name: "Canvas Painting", price: 120, image_url: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400" },
                { id: 4, name: "Handcrafted Vase", price: 35, image_url: "https://images.unsplash.com/photo-1581781870027-04212e231e96?auto=format&fit=crop&q=80&w=400" }
            ];
            const container = document.getElementById('new-arrivals');
            if (container) {
                container.innerHTML = demoProds.map(prod => renderCard(prod, 'product')).join('');
            }
        }
    } catch (e) {
        console.error("Error fetching products:", e);
    }
});
