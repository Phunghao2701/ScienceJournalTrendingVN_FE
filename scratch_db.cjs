const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.ztvpoiglgrqkixmxjhrs:Lephunghao2005!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    
    // Find topics with multiple articles
    const query = `
      SELECT primary_topic, COUNT(*) as topic_count, json_agg(json_build_object('article_id', article_id, 'title', title)) as articles
      FROM "Article"
      WHERE primary_topic IS NOT NULL
      GROUP BY primary_topic
      HAVING COUNT(*) > 1
      ORDER BY topic_count DESC
      LIMIT 3
    `;
    const res = await client.query(query);
    console.log("TOPICS WITH MULTIPLE ARTICLES:");
    console.log(JSON.stringify(res.rows, null, 2));

  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await client.end();
  }
}
run();

