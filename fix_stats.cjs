const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.get\("\/api\/admin\/stats", async \(req, res\) => \{[\s\S]*?\}\);/m;

const replacement = `app.get("/api/admin/stats", async (req, res) => {
    try {
      console.log("Fetching admin stats...");
      let totalCourses = 0;
      let dbCoursesCount = 0;
      if (supabase) {
        try {
          const { count, error } = await supabase.from('courses').select('*', { count: 'exact', head: true });
          if (!error && count !== null) {
            dbCoursesCount = count;
          }
        } catch (err) {}
      }
      const localCourses = getLocalCourses();
      totalCourses = dbCoursesCount + localCourses.length;
      
      let totalBuyers = 0;
      if (supabase) {
        const { data, error } = await supabase.from('profiles').select('id').not('role', 'eq', 'admin');
        if (!error && data) {
          totalBuyers = data.length;
        }
      }

      let totalRevenue = 0;
      if (supabase) {
        const { data, error } = await supabase.from('purchases').select('version_id');
        if (!error && data) {
          totalRevenue = data.reduce((sum, item) => {
            return sum + (item.version_id === '1' ? 49 : 99);
          }, 0);
        }
      }

      let totalMCQsAnswered = 0;
      if (supabase) {
        const { count, error } = await supabase.from('user_progress').select('*', { count: 'exact', head: true });
        if (!error && count !== null) {
          totalMCQsAnswered = count * 5;
        }
      }

      res.json({
        totalCourses,
        totalBuyers,
        totalRevenue,
        totalMCQsAnswered
      });
    } catch (err: any) {
      console.error("Error fetching admin stats:", err);
      res.json({
        totalCourses: 0,
        totalBuyers: 0,
        totalRevenue: 0,
        totalMCQsAnswered: 0
      });
    }
  });`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('server.ts', code, 'utf8');
    console.log("Replaced successfully");
} else {
    console.log("Regex did not match");
}
