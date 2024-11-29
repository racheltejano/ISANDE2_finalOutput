const supabaseClient = require('../database/supabaseClient');

// Function to get the count of pending sellers
const getPendingSellersCount = async (req, res, next) => {
    try {
        const { count, error } = await supabaseClient
            .from('sellers')
            .select('seller_id', { count: 'exact' }) // Use `seller_id` for this specific query
            .eq('approval_status', false);

        if (error) {
            console.error('Error fetching pending sellers count:', error);
            return res.status(500).json({ message: 'Failed to fetch pending sellers count' });
        }

        req.pendingSellersCount = count || 0; // Attach count to request object for the dashboard
        next(); // Move to the next middleware or route handler
    } catch (err) {
        console.error('Unexpected error fetching pending sellers count:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Function to get pending sellers
const getPendingSellers = async (req, res) => {
    try {
        // Fetch sellers with approval_status = false from Supabase
        const { data: sellers, error } = await supabaseClient
            .from('sellers') // Replace 'sellers' with your table name
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
    const { action } = req.body; // Either 'approve' or 'reject'

    try {
        if (action === 'approve') {
            // Approve the seller: update approval_status to true
            const { error } = await supabaseClient
                .from('sellers')
                .update({ approval_status: true })
                .eq('seller_id', sellerId);

            if (error) {
                console.error('Error approving seller:', error);
                return res.status(500).json({ success: false, message: 'Failed to approve seller' });
            }
        } else if (action === 'reject') {
            // Reject the seller: delete the seller from the database
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

// Function to get Inventory
const getInventory = async (req, res) => {
    const categoryFilter = req.query.category;

    try {
        let query = supabaseClient.from('products').select(`
            id,
            name,
            price,
            stock,
            seller: sellers (name),
            category: categories (name),
            status,
            product_images: product_images (image_id, image_url),
            product_attributes: product_attributes (
                value,
                attribute: attributes (name)
            )
        `);

        if (categoryFilter) {
            query = query.eq('category.id', categoryFilter); // Adjust based on your database structure
        }

        const { data: products, error } = await query;

        if (error) throw error;

        const inventory = products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            seller: product.seller.name,
            category: product.category.name,
            status: product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock',
            images: product.product_images,
            attributes: product.product_attributes.map(attr => ({
                value: attr.value,
                name: attr.attribute.name,
            })),
        }));

        // Fetch categories for dropdown
        const { data: categories } = await supabaseClient.from('categories').select('*');

        res.render('System/admin/adminInventory', { inventory, categories });

    } catch (err) {
        console.error('Error fetching inventory data:', err); // Log the detailed error
        res.status(500).send('Error fetching inventory data.');
    }
};



module.exports = {
    getPendingSellersCount,
    getPendingSellers,
    updateSellerApproval,
    getInventory
};
