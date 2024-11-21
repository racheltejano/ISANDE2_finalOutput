const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const { createClient } = require('@supabase/supabase-js');

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


module.exports = supabaseClient

console.log("supabaseClient.js loaded!");
