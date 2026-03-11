import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outDir = path.resolve("output/web-game");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push({ type: "console", text: msg.text() });
});
page.on("pageerror", (err) => {
  errors.push({ type: "pageerror", text: String(err) });
});

await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.click("#startBtn");
await page.click("#worldCanvas", { position: { x: 250, y: 375 } });
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(outDir, "shot-0.png"), fullPage: true });

const step = async (index, action) => {
  if (action === "speed16") {
    await page.click('[data-speed="16"]');
  }
  if (action === "rain") {
    await page.click('[data-disaster="rain"]');
  }
  if (action === "drought") {
    await page.click('[data-disaster="drought"]');
  }
  if (action === "restart") {
    await page.click('#restartBtn');
  }
  if (action === "inspectCity") {
    await page.click("#worldCanvas", { position: { x: 610, y: 320 } });
  }
  await page.waitForTimeout(300);
  await page.evaluate(() => window.advanceTime(25000));
  await page.waitForTimeout(100);
  const state = await page.evaluate(() => window.render_game_to_text());
  fs.writeFileSync(path.join(outDir, `state-${index}.json`), state);
  await page.screenshot({ path: path.join(outDir, `shot-${index}.png`), fullPage: true });
};

await step(1, "speed16");
await step(2, "rain");
await step(3, "inspectCity");
await step(4, "restart");
await step(5, "drought");

fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
await browser.close();
