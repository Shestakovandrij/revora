import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.argv[2] || "http://localhost:3000/";
const out = process.argv[3] || "/tmp/shot.png";
const width = Number(process.argv[4] || 1440);
const cookie = process.argv[5]; // optional "name=value"

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
if (cookie) {
  const [name, ...rest] = cookie.split("=");
  await page.setCookie({ name, value: rest.join("="), url });
}
await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
await new Promise((r) => setTimeout(r, 1500)); // дати гідратації прикріпити IntersectionObserver
// Повільно прокрутити всю сторінку, щоб тригернути whileInView reveal (once:true лишає їх видимими)
await page.evaluate(async () => {
  const H = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  await new Promise((res) => {
    const step = () => {
      window.scrollBy(0, 280);
      if (window.scrollY + window.innerHeight < H() - 4) setTimeout(step, 170);
      else res();
    };
    step();
  });
  window.scrollTo(0, H());
});
await new Promise((r) => setTimeout(r, 1400)); // дати reveal-анімаціям завершитись
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("saved", out);
