const supabaseClient = require('./server/database/supabaseClient');

async function testConnection() {
    try {
        // Replace 'your_table_name' with the name of a table in your Supabase database
        const { data, error } = await supabaseClient
            .from('users')
            .select('*');

        if (error) {
            console.error("Error fetching data:", error.message);
        } else {
            console.log("Connection successful! Data:", data);
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

testConnection();
