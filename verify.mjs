import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outDir = path.resolve("output/web-game");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const getState = async () => JSON.parse(await page.evaluate(() => window.render_game_to_text()));
const getDisasterTags = async () => page.$$eval("#activeDisasters .tag", (nodes) => nodes.map((node) => node.textContent.trim()));
const clickDom = async (selector) => {
  await page.evaluate((target) => {
    const node = document.querySelector(target);
    if (!node) throw new Error(`missing element: ${target}`);
    node.click();
  }, selector);
};

page.on("console", (msg) => {
  if (msg.type() === "error") errors.push({ type: "console", text: msg.text() });
});
page.on("pageerror", (err) => {
  errors.push({ type: "pageerror", text: String(err) });
});

try {
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
  await clickDom("#startBtn");
  await page.click('[data-speed="1"]');
  await page.waitForTimeout(250);

  const initialState = await getState();
  fs.writeFileSync(path.join(outDir, "state-0.json"), JSON.stringify(initialState, null, 2));
  await page.screenshot({ path: path.join(outDir, "shot-0.png"), fullPage: true });

  assert(initialState.population === 8, `expected initial population 8, got ${initialState.population}`);
  assert(!initialState.structuresByKind.campfire, "campfire should not exist at initial start");
  assert(initialState.activeDisasters.length === 0, "no disasters should be active at start");

  await page.click('[data-disaster="rain"]');
  await page.click('[data-disaster="rain"]');
  await page.click('[data-disaster="rain"]');
  await page.waitForTimeout(120);
  const rainState = await getState();
  const rainTags = await getDisasterTags();
  fs.writeFileSync(path.join(outDir, "state-1-rain.json"), JSON.stringify(rainState, null, 2));

  const rainEntries = rainState.activeDisasters.filter((type) => type === "rain");
  const rainDetail = rainState.disasterDetails.find((item) => item.type === "rain");
  assert(rainEntries.length === 1, `rain should be active once, got ${rainEntries.length}`);
  assert(rainDetail, "rain disaster detail missing");
  assert(rainDetail.durationMonths >= 1 && rainDetail.durationMonths <= 12, `rain duration out of range: ${rainDetail.durationMonths}`);
  assert(rainDetail.remainingMonths >= 1 && rainDetail.remainingMonths <= 12, `rain remaining months out of range: ${rainDetail.remainingMonths}`);
  assert(rainTags.filter((text) => text.includes("비")).length === 1, "rain tag should appear only once");

  await page.evaluate(() => window.advanceTime(2600));
  await page.waitForTimeout(150);
  const settledRainState = await getState();
  fs.writeFileSync(path.join(outDir, "state-1b-after-rain.json"), JSON.stringify(settledRainState, null, 2));
  assert(!settledRainState.activeDisasters.includes("rain"), "rain should have ended within 12 months");
  assert(
    settledRainState.recentEvents.some((entry) => entry.includes("비 재해가 끝나고")),
    "rain disaster end log should be present after rain resolution"
  );

  await clickDom("#restartBtn");
  await page.waitForTimeout(250);
  await clickDom("#startBtn");
  await page.click('[data-speed="1"]');
  await page.waitForTimeout(250);

  await page.click('[data-disaster="landslide"]');
  await page.click('[data-disaster="landslide"]');
  await page.waitForTimeout(120);
  const landslideState = await getState();
  const landslideTags = await getDisasterTags();
  fs.writeFileSync(path.join(outDir, "state-2-landslide.json"), JSON.stringify(landslideState, null, 2));
  await page.screenshot({ path: path.join(outDir, "shot-2-landslide.png"), fullPage: true });

  const landslideEntries = landslideState.activeDisasters.filter((type) => type === "landslide");
  const landslideDetail = landslideState.disasterDetails.find((item) => item.type === "landslide");
  assert(landslideEntries.length === 1, `landslide should be active once, got ${landslideEntries.length}`);
  assert(landslideDetail, "landslide disaster detail missing");
  assert(landslideDetail.durationMonths >= 1 && landslideDetail.durationMonths <= 12, `landslide duration out of range: ${landslideDetail.durationMonths}`);
  assert(landslideTags.filter((text) => text.includes("산사태")).length === 1, "landslide tag should appear only once");
  assert(
    landslideState.recentEvents.some((entry) => entry.includes("산사태로 주민") && entry.includes("건물")),
    "landslide log should contain concrete casualty and building damage details"
  );

  await page.evaluate(() => window.advanceTime(2600));
  await page.waitForTimeout(150);
  const settledState = await getState();
  fs.writeFileSync(path.join(outDir, "state-3-after-disasters.json"), JSON.stringify(settledState, null, 2));
  await page.screenshot({ path: path.join(outDir, "shot-3-after-disasters.png"), fullPage: true });

  assert(!settledState.activeDisasters.includes("landslide"), "landslide should have ended within 12 months");
  assert(
    settledState.recentEvents.some((entry) => entry.includes("재해가 끝나고")),
    "disaster end log should be present after disaster resolution"
  );

  await clickDom("#restartBtn");
  await page.waitForTimeout(250);
  await clickDom("#startBtn");
  await page.waitForTimeout(120);
  await page.click('[data-speed="1"]');
  let chainedState = await getState();
  for (let month = 0; month < 60; month += 1) {
    if (!chainedState.activeDisasters.includes("rain") && !chainedState.activeDisasters.includes("landslide")) {
      await page.click('[data-disaster="rain"]');
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => window.advanceTime(180));
    await page.waitForTimeout(30);
    chainedState = await getState();
    if (chainedState.recentEvents.some((entry) => entry.includes("긴 비로 지반이 약해져 산사태 발생"))) break;
  }
  fs.writeFileSync(path.join(outDir, "state-4-chain-rain-landslide.json"), JSON.stringify(chainedState, null, 2));
  await page.screenshot({ path: path.join(outDir, "shot-4-chain-rain-landslide.png"), fullPage: true });

  assert(
    chainedState.recentEvents.some((entry) => entry.includes("긴 비로 지반이 약해져 산사태 발생")),
    "prolonged rain should be able to trigger a chained landslide event"
  );
  assert(
    chainedState.activeDisasters.includes("landslide") || chainedState.recentEvents.some((entry) => entry.includes("산사태 발생")),
    "chained landslide should be visible in state or event log"
  );

  if (errors.length) throw new Error(`browser errors detected: ${JSON.stringify(errors)}`);
} finally {
  fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
  await browser.close();
}
