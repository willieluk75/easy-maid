const { Client } = require('pg');
const fs = require('fs');

const envContent = fs.readFileSync('/home/user/supabase/.env', 'utf8');
const match = envContent.match(/POSTGRES_PASSWORD=(.+)/);
const password = match ? match[1].trim() : '';

const client = new Client({
  host: '100.114.120.22',
  port: 5432,
  database: 'postgres',
  user: 'supabase_admin',
  password: password,
  connectionTimeoutMillis: 5000,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase!');
    
    // 1. Update existing workers photo_url
    await client.query("UPDATE public.workers SET photo_url = 'https://easy-maid-feb.vercel.app/images/workers/worker-1.jpg' WHERE name = 'Priya Sharma'");
    await client.query("UPDATE public.workers SET photo_url = 'https://easy-maid-feb.vercel.app/images/workers/worker-2.jpg' WHERE name = 'Siti Rahayu'");
    await client.query("UPDATE public.workers SET photo_url = 'https://easy-maid-feb.vercel.app/images/workers/worker-3.jpg' WHERE name = 'Maria Santos'");
    console.log('Updated 3 existing workers photo_url');

    // 2. Insert 3 new workers
    const insertResult = await client.query(`
      INSERT INTO public.workers (name, nationality, status, photo_url, skill_cooking, skill_household, skill_care_elderly, skill_gardening, skill_care_children)
      VALUES
        ('Nandar Win', 'Myanmar', 'available', 'https://easy-maid-feb.vercel.app/images/workers/worker-4.jpg', true, true, true, true, false),
        ('Linh Nguyen', 'Vietnamese', 'available', 'https://easy-maid-feb.vercel.app/images/workers/worker-5.jpg', true, true, false, false, true),
        ('Anita Gurung', 'Nepalese', 'available', 'https://easy-maid-feb.vercel.app/images/workers/worker-6.jpg', true, true, true, false, false)
      ON CONFLICT DO NOTHING
      RETURNING id, name, nationality
    `);
    console.log('Inserted new workers:', JSON.stringify(insertResult.rows));

    // 3. Update existing media URLs to work scene photos
    await client.query("UPDATE public.worker_media SET url = 'https://easy-maid-feb.vercel.app/images/feed/feed-1.jpg', caption = '今日幫僱主打掃完廚房，灶台光亮如新 ✨' WHERE url LIKE '%/seed/priya%'");
    await client.query("UPDATE public.worker_media SET url = 'https://easy-maid-feb.vercel.app/images/feed/feed-2.jpg', caption = '照顧長者經驗豐富，耐心細心' WHERE url LIKE '%/seed/siti1%'");
    await client.query("UPDATE public.worker_media SET url = 'https://easy-maid-feb.vercel.app/images/feed/feed-3.jpg', caption = '為小朋友準備嘅健康午餐 🍱' WHERE url LIKE '%/seed/siti2%'");
    await client.query("UPDATE public.worker_media SET url = 'https://easy-maid-feb.vercel.app/images/feed/feed-4.jpg', caption = '日常工作照' WHERE url LIKE '%/seed/maria1%'");
    await client.query("UPDATE public.worker_media SET url = 'https://easy-maid-feb.vercel.app/images/feed/feed-5.jpg', caption = '廚藝展示 👩‍🍳' WHERE url LIKE '%/seed/maria2%'");
    await client.query("UPDATE public.worker_media SET url = 'https://easy-maid-feb.vercel.app/images/feed/feed-6.jpg', caption = '同 BB 玩得好開心 😊' WHERE url LIKE '%/seed/maria3%'");
    console.log('Updated media URLs');

    // 4. Verify
    const workers = await client.query('SELECT id, name, nationality, photo_url, status FROM public.workers ORDER BY created_at');
    console.log('ALL Workers:', JSON.stringify(workers.rows, null, 2));
    
    const media = await client.query('SELECT url, caption FROM public.worker_media ORDER BY created_at');
    console.log('ALL Media:', JSON.stringify(media.rows, null, 2));
    
    await client.end();
    console.log('Done!');
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}
run();
