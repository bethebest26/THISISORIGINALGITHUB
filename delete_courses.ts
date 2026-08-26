import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

async function run() {
    const supabaseUrl = "https://bicjcaxoaagpoeynnpzx.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2pjYXhvYWFncG9leW5ucHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MDI4MDIsImV4cCI6MjA5OTE3ODgwMn0.ROGDCPnfFX-bUQ7Ii2hSvMjKKjdpUyLlrOGc0MB5L1E";
    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials");
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Fetching courses...");
    const { data: courses, error: fetchError } = await supabase.from('courses').select('id');
    if (fetchError) { console.error("Error fetching courses:", fetchError); return; }
    
    console.log("Found", courses?.length, "courses.");
    
    if (courses && courses.length > 0) {
        const courseIds = courses.map(c => c.id);
        console.log("Deleting courses with IDs:", courseIds);
        const { error: deleteError } = await supabase.from('courses').delete().in('id', courseIds);
        if (deleteError) { console.error("Error deleting courses:", deleteError); return; }
        console.log("Successfully deleted courses.");
    }
}
run();
