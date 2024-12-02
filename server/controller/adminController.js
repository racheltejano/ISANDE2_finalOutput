const supabaseClient = require('../database/supabaseClient');

// Function to get the count of pending sellers
const getPendingSellersCount = async (req, res, next) => {
    try {
        const { count, error } = await supabaseClient
            .from('sellers')
            .select('seller_id', { count: 'exact' }) 
            .eq('approval_status', false);

        if (error) {
            console.error('Error fetching pending sellers count:', error);
            return res.status(500).json({ message: 'Failed to fetch pending sellers count' });
        }

        req.pendingSellersCount = count || 0; 
        next(); 
    } catch (err) {
        console.error('Unexpected error fetching pending sellers count:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const getProductCount = async () => {
    const { count, error } = await supabaseClient
        .from('products')
        .select('product_id', { count: 'exact' });

    if (error) {
        console.error('Error fetching product count:', error);
        throw error;
    }

    return count || 0;
};




// Function to get pending sellers
const getPendingSellers = async (req, res) => {
    try {
       
        const { data: sellers, error } = await supabaseClient
            .from('sellers') 
            .select('*, user:users(username)')
            .eq('approval_status', false);

        if (error) {
            console.error('Error fetching pending sellers:', error);
            return res.status(500).json({ message: 'Failed to fetch pending sellers' });
        }

        res.render('System/admin/adminSellerApproval', {
            pageTitle: 'Pending Seller Approval',
            pendingSellers: sellers,
        });
        
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Function to update seller approval status
const updateSellerApproval = async (req, res) => {
    const { sellerId } = req.params;
    const { action } = req.body; 

    try {
        if (action === 'approve') {
            const { error } = await supabaseClient
                .from('sellers')
                .update({ approval_status: true })
                .eq('seller_id', sellerId);

            if (error) {
                console.error('Error approving seller:', error);
                return res.status(500).json({ success: false, message: 'Failed to approve seller' });
            }
        } else if (action === 'reject') {
            const { error } = await supabaseClient
                .from('sellers')
                .delete()
                .eq('seller_id', sellerId);

            if (error) {
                console.error('Error rejecting seller:', error);
                return res.status(500).json({ success: false, message: 'Failed to reject seller' });
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating seller approval status:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating seller approval status.' });
    }
};


// Function to fetch summarized inventory data
const getInventorySummary = async () => {
    try {
        // Fetch top 5 products sorted by stock
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('name, stock') 
            .eq('status', true)
            .order('stock', { ascending: true }) 
            .limit(5); 

        if (error) {
            console.error('Error fetching inventory summary:', error);
            throw error;
        }

        // Categorize products into stock statuses
        const inventorySummary = products.map(product => ({
            name: product.name,
            stock: product.stock,
            status: product.stock === 0
                ? 'Out of Stock'
                : product.stock < 10
                ? 'Low Stock'
                : 'In Stock',
        }));


        return inventorySummary;
    } catch (err) {
        console.error('Error in getInventorySummary:', err);
        throw err;
    }
};


// Function to fetch products
const fetchProducts = async (categoryFilter, sellerFilter, viewFilter) => {
    let query = supabaseClient.from('products').select(`
        product_id,
        name,
        price,
        stock,
        seller: sellers (name, seller_id),
        category: categories (category_id, category_name),
        status,
        product_images: product_images (image_id, image_url),
        product_attributes: product_attributes (
            value,
            attribute: attributes (attribute_name)
        )
    `);

    if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
    }
    if (sellerFilter && sellerFilter !== 'all') {
        console.log(`Filtering by seller_id: ${sellerFilter}`);
        query = query.eq('seller_id', sellerFilter);  
    }
    if (viewFilter) {
        if (viewFilter === 'inStock') {
            query = query.gt('stock', 0);
        } else if (viewFilter === 'outOfStock') {
            query = query.eq('stock', 0);
        }
    }

    const { data: products, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        throw error;
    }

    return products;
};

// Function to format the inventory
const formatInventory = (products) => {
    return products.map(product => ({
        id: product.product_id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        seller: product.seller.name,
        category: product.category.category_name,
        status: product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock',
        images: product.product_images,
        attributes: product.product_attributes.map(attr => ({
            value: attr.value,
            name: attr.attribute.name,
        })),
    }));
};

// Function to fetch categories
const fetchCategories = async () => {
    const { data: categories, error } = await supabaseClient.from('categories').select('*');
    if (error) throw error; 
    const allCategoriesOption = { category_id: 'all', category_name: 'All Categories' };
    return [allCategoriesOption, ...categories];
};

/* Fetch Inventory Functions */
const fetchSellers = async () => {
    const { data: sellers, error } = await supabaseClient
        .from('sellers')
        .select('seller_id, name, approval_status') 
        .eq('approval_status', true);  // Only fetch sellers with approval status true

    if (error) {
        console.error('Error fetching sellers:', error);
        throw error;
    }

    const allSellersOption = { seller_id: 'all', name: 'All Sellers' };
    return [allSellersOption, ...sellers];
};

// Main function to get Inventory
const getInventory = async (req, res) => {
    console.log(req.query);
    const categoryFilter = req.query.category;
    const sellerFilter = req.query.seller;
    const viewFilter = req.query.view;


    try {
        let productCount = 0;
        try {
            productCount = await getProductCount();
        } catch (countError) {
            console.error('Error fetching product count:', countError);
            productCount = 0; 
        }

        const products = await fetchProducts(categoryFilter, sellerFilter, viewFilter);
        const inventory = formatInventory(products);
        const categories = await fetchCategories();
        const sellers = await fetchSellers();

       res.render('System/admin/adminInventory', {
            inventory,
            categories,
            sellers,
            selectedCategory: categoryFilter,
            selectedSeller: sellerFilter,
            selectedView: viewFilter,
            productCount,
        });

    } catch (err) {
        console.error('Error fetching inventory data:', err); 
        res.status(500).send('Error fetching inventory data.');
    }
};

module.exports = {
    getPendingSellersCount,
    getPendingSellers,
    updateSellerApproval,
    getInventory,
    getProductCount,
    getInventorySummary
};
