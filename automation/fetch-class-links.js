/**
 * CAMPUS 6.0 — phyhunt.com Auto Scraper (v2 — video-verified)
 *
 * Target: https://phyhunt.com/profile/ (one page = Live Classes + Live Exams + Courses)
 * Login: phone + password (no OTP)
 * Output: Supabase class_links (link_type: exam | class | course)
 */

require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const PH_LOGIN = 'https://phyhunt.com/login';
const PH_PROFILE = 'https://phyhunt.com/profile/';

async function run() {
  console.log('🚀 [PH] starting', new Date().toISOString());
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    // ─── 1. LOGIN (phone + password) ───
    console.log('🔐 [PH] logging in...');
    await page.goto(PH_LOGIN, { waitUntil: 'networkidle2', timeout: 45000 });
    const userSel =
      'input[type="tel"], input[name="phone"], input[name="mobile"], input[placeholder*="hone"], input[placeholder*="obile"], input[type="email"], input[type="text"]';
    await page.waitForSelector(userSel, { timeout: 20000 });
    await page.type(userSel, process.env.PH_USERNAME || '', { delay: 30 });
    await page.type('input[type="password"]', process.env.PH_PASSWORD || '', { delay: 30 });
    await page.click('button[type="submit"]').catch(() => page.keyboard.press('Enter'));
    await new Promise((r) => setTimeout(r, 5000));
    console.log('✅ [PH] login done, url =', page.url());

    // ─── 2. PROFILE PAGE (সব section এখানে) ───
    await page.goto(PH_PROFILE, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 4000));

    // lazy-load sections এর জন্য পুরো page scroll
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 200));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 2500));

    // ─── 3. EXTRACT (text-anchor based — video-verified) ───
    const found = await page.evaluate(() => {
      const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
      const out = { exams: [], classes: [], courses: [], portal: null };
      const clickables = [...document.querySelectorAll('a, button')];

      const cardUp = (el, test, max = 10) => {
        let n = el;
        for (let i = 0; i < max && n; i++) {
          n = n.parentElement;
          if (n && test(n)) return n;
        }
        return null;
      };

      // 🩷 LIVE EXAMS — "এক্সাম দেই" buttons
      clickables
        .filter((el) => norm(el.textContent).includes('এক্সাম দেই'))
        .forEach((btn, i) => {
          const card =
            cardUp(btn, (n) => /Live Exam/i.test(n.textContent || ''), 8) || btn.parentElement;
          const text = norm(card ? card.textContent : '');
          const title = (text.match(/Live Exam[-–:]?\s*(.+?)(?:ক্যাম্পাস|Campus|\d{2}\/\d{2})/i) || [])[1] || 'Live Exam';
          const course = (text.match(/(ক্যাম্পাস[^\n]*?\[[A-Z]+\])/) || [])[1] || '';
          const date = (text.match(/(\d{2}\/\d{2}\/\d{4})/) || [])[1] || '';
          const endsIn = (text.match(/শেষ হবে:\s*([\ddhms\s]+?)(?:এক্সাম|$)/) || [])[1] || '';
          out.exams.push({ title: norm(title), course, date, endsIn: norm(endsIn), i });
        });

      // 🟢 LIVE CLASSES — "Live Classes" section এর ভেতরের items
      const liveHeader = [...document.querySelectorAll('h1,h2,h3,h4,div,span')].find(
        (el) => norm(el.textContent) === 'Live Classes'
      );
      if (liveHeader) {
        const sec = cardUp(liveHeader, (n) => (n.textContent || '').includes('চলমান লাইভ ক্লাস'), 6);
        if (sec) {
          const items = [...sec.querySelectorAll('a, button')].filter(
            (b) => norm(b.textContent).length > 2 && !/Live Classes|চলমান লাইভ/.test(norm(b.textContent))
          );
          items.forEach((b, i) => {
            const card = cardUp(b, (n) => (n.textContent || '').length > 30, 5) || b.parentElement;
            out.classes.push({ title: norm(card ? card.textContent : b.textContent).slice(0, 80), i });
          });
        }
      }

      // 🟣 COURSES — "Start Course" / "কোর্স শুরু করুন"
      clickables
        .filter((el) => /Start Course|কোর্স শুরু করুন/i.test(norm(el.textContent)))
        .forEach((btn, i) => {
          const card = cardUp(btn, (n) => /ENROLLED/i.test(n.textContent || ''), 8);
          const text = norm(card ? card.textContent : '');
          const title = (text.match(/ENROLLED\s+(.+?)(?:Notice|Start)/i) || [])[1] || text.slice(0, 60);
          out.courses.push({ title: norm(title), i });
        });

      // 🟣 EXAM PORTAL button
      const portalBtn = clickables.find((el) => /Enter New Exam Portal/i.test(norm(el.textContent)));
      if (portalBtn) out.portal = portalBtn.href || null;

      return out;
    });

    console.log(`📊 [PH] exams=${found.exams.length} classes=${found.classes.length} courses=${found.courses.length} portal=${!!found.portal}`);

    // ─── 4. DEEP URL capture (click → url → back) ───
    const deep = {};
    const capture = async (key, matchText) => {
      try {
        const handle = await page.evaluateHandle((m) => {
          const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
          return [...document.querySelectorAll('a, button')].find((el) => norm(el.textContent).includes(m));
        }, matchText);
        const el = handle.asElement();
        if (!el) return;
        await el.click();
        await new Promise((r) => setTimeout(r, 4000));
        deep[key] = page.url();
        console.log(`🔗 [PH] deep ${key} =`, deep[key]);
        await page.goto(PH_PROFILE, { waitUntil: 'networkidle2', timeout: 45000 });
        await new Promise((r) => setTimeout(r, 2500));
      } catch (e) {
        console.warn('⚠️ [PH] capture failed:', key, e.message);
      }
    };

    if (found.exams.length) await capture('exam', 'এক্সাম দেই');
    if (found.classes.length) await capture('class', 'লাইভ ক্লাস');
    if (found.courses.length) await capture('course', 'Start Course');
    if (found.portal) deep.portal = found.portal;

    // ─── 5. SAVE TO SUPABASE ───
    const today = new Date().toISOString().split('T')[0];
    let idx = 1;

    const save = async (row) => {
      const { error } = await supabase.from('class_links').upsert(row, {
        onConflict: 'date_key,session_index',
      });
      console.log(error ? `❌ [DB] ${error.message}` : `✅ [DB] ${row.link_type}: ${row.title}`);
    };

    for (const e of found.exams) {
      await save({
        date_key: today, session_index: idx++, link_type: 'exam', platform: 'phyhunt',
        title: e.title || 'Live Exam', time: e.date, ends_in: e.endsIn,
        url: deep.exam || PH_PROFILE,
      });
    }
    for (const c of found.classes) {
      await save({
        date_key: today, session_index: idx++, link_type: 'class', platform: 'phyhunt',
        title: c.title || 'Live Class', url: deep.class || PH_PROFILE,
      });
    }
    for (const c of found.courses) {
      await save({
        date_key: today, session_index: idx++, link_type: 'course', platform: 'phyhunt',
        title: c.title || 'Course', url: deep.course || PH_PROFILE,
      });
    }
    if (deep.portal) {
      await save({
        date_key: today, session_index: idx++, link_type: 'portal', platform: 'phyhunt',
        title: 'Exam Portal', url: deep.portal,
      });
    }

    console.log('🎉 [PH] done');
  } catch (e) {
    console.error('❌ [PH] failed:', e.message);
    try {
      await page.screenshot({ path: 'debug.png', fullPage: true });
      fs.writeFileSync('debug.html', await page.content());
      console.log('📸 debug.png + debug.html saved');
    } catch {}
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();