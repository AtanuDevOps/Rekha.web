// Initialize Supabase Client
let supabaseClient;

function initSupabase() {
    if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== "YOUR_SUPABASE_URL") {
        // The library exposes 'supabase' as the global object
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    }

    if (!supabaseClient) {
        console.warn("Supabase not configured. Using mock client for demo.");
        supabaseClient = {
            from: (table) => ({
                select: () => ({
                    eq: () => Promise.resolve({ data: [], error: null }),
                    order: () => Promise.resolve({ data: [], error: null }),
                    limit: () => Promise.resolve({ data: [], error: null }),
                    single: () => Promise.resolve({ data: null, error: null }),
                    then: (cb) => cb({ data: [], error: null })
                }),
                insert: () => Promise.resolve({ data: null, error: "Supabase not configured" }),
                update: () => Promise.resolve({ data: null, error: "Supabase not configured" }),
                delete: () => Promise.resolve({ data: null, error: "Supabase not configured" })
            }),
            auth: {
                signInWithPassword: () => Promise.resolve({ data: null, error: "Supabase not configured" }),
                signOut: () => Promise.resolve({ error: null }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null })
            }
        };
    }
}

initSupabase();

// Cart Logic
const cart = {
    get: () => JSON.parse(localStorage.getItem('rekha_cart')) || [],
    add: (product, quantity = 1) => {
        const items = cart.get();
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            items.push({ ...product, quantity });
        }
        localStorage.setItem('rekha_cart', JSON.stringify(items));
        cart.updateCountUI();
        alert(`${product.name} added to cart!`);
    },
    remove: (productId) => {
        const items = cart.get().filter(i => i.id !== productId);
        localStorage.setItem('rekha_cart', JSON.stringify(items));
        cart.updateCountUI();
    },
    updateQuantity: (productId, quantity) => {
        const items = cart.get();
        const item = items.find(i => i.id === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) return cart.remove(productId);
            localStorage.setItem('rekha_cart', JSON.stringify(items));
            cart.updateCountUI();
        }
    },
    clear: () => {
        localStorage.removeItem('rekha_cart');
        cart.updateCountUI();
    },
    total: () => {
        return cart.get().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    updateCountUI: () => {
        const count = cart.get().reduce((sum, item) => sum + item.quantity, 0);
        const el = document.querySelector('.cart-count');
        if (el) el.textContent = count;
    }
};

// Auth Helpers
const auth = {
    check: () => {
        const isLoggedIn = localStorage.getItem("rekha_admin_logged_in") === "true";
        if (!isLoggedIn) {
            window.location.href = 'login.html';
        }
        return isLoggedIn;
    },
    login: async (email, password) => {
        try {
            const { data, error } = await supabaseClient
                .from('admins')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .single();

            if (data) {
                localStorage.setItem("rekha_admin_logged_in", "true");
                localStorage.setItem("rekha_admin_user", JSON.stringify(data));
                return { success: true };
            } else {
                return { success: false, message: "Invalid email or password" };
            }
        } catch (err) {
            console.error("Login error:", err);
            return { success: false, message: "Error during login. Check if 'admins' table exists." };
        }
    },
    logout: () => {
        localStorage.removeItem("rekha_admin_logged_in");
        localStorage.removeItem("rekha_admin_user");
        window.location.href = 'login.html';
    }
};

// UI Helpers
function renderCard(item, type = 'product') {
    if (type === 'category') {
        return `
            <div class="card">
                <a href="products.html?category=${item.id}">
                    <img src="${item.image || 'https://via.placeholder.com/400x300?text=Category'}" alt="${item.name}" class="card-img">
                    <div class="card-content">
                        <h3 class="card-title">${item.name}</h3>
                        <p>${item.description || ''}</p>
                    </div>
                </a>
            </div>
        `;
    }
    return `
        <div class="card">
            <a href="product-details.html?id=${item.id}">
                <img src="${item.image_url || 'https://via.placeholder.com/400x300?text=Product'}" alt="${item.name}" class="card-img">
            </a>
            <div class="card-content">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-price">$${item.price}</p>
                <button onclick='cart.add(${JSON.stringify(item)})' class="btn" style="width: 100%;">Add to Cart</button>
            </div>
        </div>
    `;
}

// Cloudinary Upload
async function uploadImage(file) {
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === "YOUR_CLOUDINARY_CLOUD_NAME") {
        console.error("Cloudinary not configured");
        return null;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    return data.secure_url;
}

// Initial count update
document.addEventListener('DOMContentLoaded', cart.updateCountUI);
