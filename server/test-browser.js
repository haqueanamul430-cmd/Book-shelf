const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function assert(condition, message) {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`PASSED: ${message}`);
}

async function runBrowserVerification() {
  console.log(`=== STARTING HEADLESS BROWSER VERIFICATION ===`);
  console.log(`Using browser: ${CHROME_PATH}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Test
    await page.setViewport({ width: 1280, height: 800 });
    console.log('\n--- 1. Testing Desktop Layout & Initial Load ---');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    const titleText = await page.$eval('h1', (el) => el.textContent.trim());
    assert(titleText === 'BookShelf Manager', `Found app header "${titleText}"`);

    // Verify form exists
    const titleInput = await page.$('#book-title');
    const authorInput = await page.$('#book-author');
    assert(titleInput !== null, 'Title input is present');
    assert(authorInput !== null, 'Author input is present');

    // 2. Client-side Form Validation
    console.log('\n--- 2. Testing Client-Side Validation ---');
    // Click submit with empty form
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 200));

    const inlineErrors = await page.$$eval('p.text-rose-600', (els) => els.map((e) => e.textContent.trim()));
    assert(inlineErrors.length >= 2, `Inline validation triggered for both empty fields (Found ${inlineErrors.length} errors)`);
    console.log(`Inline errors displayed: ${JSON.stringify(inlineErrors)}`);

    // 3. Add a New Book
    console.log('\n--- 3. Testing Adding a Book ---');
    await page.type('#book-title', 'Designing Data-Intensive Applications');
    await page.type('#book-author', 'Martin Kleppmann');
    await page.click('button[type="submit"]');

    // Wait for the new book to appear in the list
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('h3')).some(
        (el) => el.textContent.includes('Designing Data-Intensive Applications')
      );
    }, { timeout: 5000 });

    // Check inputs were cleared
    const titleVal = await page.$eval('#book-title', (el) => el.value);
    const authorVal = await page.$eval('#book-author', (el) => el.value);
    assert(titleVal === '' && authorVal === '', 'Form inputs were cleared after successful submission');

    // Check new book card status is "Unread"
    const newBookCard = await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const target = h3s.find((h) => h.textContent.includes('Designing Data-Intensive Applications'));
      if (!target) return null;
      const li = target.closest('li');
      return {
        text: target.textContent,
        hasStrikethrough: target.classList.contains('line-through'),
        badgeText: li.querySelector('.rounded-full')?.textContent.trim() || '',
      };
    });
    assert(newBookCard !== null, 'Found created book item');
    assert(!newBookCard.hasStrikethrough, 'Newly added book does not have strikethrough');
    assert(newBookCard.badgeText.includes('Unread'), `Newly added book has Unread badge (Got "${newBookCard.badgeText}")`);

    // 4. Mark as Read
    console.log('\n--- 4. Testing Marking Book as Read ---');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const target = h3s.find((h) => h.textContent.includes('Designing Data-Intensive Applications'));
      const li = target.closest('li');
      const markBtn = Array.from(li.querySelectorAll('button')).find((b) => b.textContent.includes('Mark as read'));
      if (markBtn) markBtn.click();
    });

    // Wait for visual updates: strikethrough, Read badge, check icon
    await page.waitForFunction(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const target = h3s.find((h) => h.textContent.includes('Designing Data-Intensive Applications'));
      if (!target) return false;
      const li = target.closest('li');
      const isStrikethrough = target.classList.contains('line-through');
      const badge = li.querySelector('.bg-emerald-100');
      return isStrikethrough && badge !== null;
    }, { timeout: 5000 });

    const readState = await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const target = h3s.find((h) => h.textContent.includes('Designing Data-Intensive Applications'));
      const li = target.closest('li');
      const markBtn = Array.from(li.querySelectorAll('button')).find((b) => b.textContent.includes('Mark as read'));
      const checkIcon = li.querySelector('svg.text-emerald-600') !== null;
      return {
        hasStrikethrough: target.classList.contains('line-through'),
        badgeText: li.querySelector('.bg-emerald-100')?.textContent.trim() || '',
        markBtnPresent: markBtn !== undefined,
        hasCheckIcon: checkIcon,
      };
    });

    assert(readState.hasStrikethrough, 'Book title has strikethrough (line-through)');
    assert(readState.badgeText.includes('Read'), `Green Read badge displayed (Got "${readState.badgeText}")`);
    assert(readState.hasCheckIcon, 'Green check icon is rendered');
    assert(!readState.markBtnPresent, '"Mark as read" button is removed/hidden or disabled once read');

    // 5. Delete Book
    console.log('\n--- 5. Testing Deleting Book ---');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const target = h3s.find((h) => h.textContent.includes('Designing Data-Intensive Applications'));
      const li = target.closest('li');
      const delBtn = Array.from(li.querySelectorAll('button')).find((b) => b.textContent.includes('Delete'));
      if (delBtn) delBtn.click();
    });

    // Wait for book to disappear
    await page.waitForFunction(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      return !h3s.some((h) => h.textContent.includes('Designing Data-Intensive Applications'));
    }, { timeout: 5000 });
    assert(true, 'Book successfully removed from UI without page reload');

    // 6. Mobile Layout Test
    console.log('\n--- 6. Testing Mobile Layout ---');
    await page.setViewport({ width: 375, height: 667 });
    await new Promise((r) => setTimeout(r, 500));

    const mobileLayoutCheck = await page.evaluate(() => {
      const main = document.querySelector('main');
      const grid = main.querySelector('.grid');
      const gridClasses = grid ? grid.className : '';
      return {
        isGrid: gridClasses.includes('grid-cols-1'),
        windowWidth: window.innerWidth,
      };
    });
    assert(mobileLayoutCheck.isGrid, 'Grid uses single-column layout on mobile (grid-cols-1)');
    assert(mobileLayoutCheck.windowWidth === 375, 'Viewport width is 375px mobile');

    console.log('\n=== ALL BROWSER E2E TESTS PASSED SUCCESSFULLY! ===\n');
  } finally {
    await browser.close();
  }
}

runBrowserVerification().catch((err) => {
  console.error('Browser verification error:', err);
  process.exit(1);
});

