// Main homepage logic
document.addEventListener('DOMContentLoaded', async () => {
    // Initial UI count
    cart.updateCountUI();

    // Fetch Featured Categories
    showLoading('homepage-categories');
    try {
        const { data: categories, error } = await supabaseClient
            .from('categories')
            .select('*')
            .limit(6); // Show a few more on homepage
        
        const container = document.getElementById('homepage-categories');
        if (container) {
            if (categories && categories.length > 0) {
                container.innerHTML = categories.map(cat => renderCard(cat, 'category')).join('');
            } else {
                container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No categories found.</p>';
            }
        }
    } catch (e) {
        console.error("Error fetching categories:", e);
    }
});
