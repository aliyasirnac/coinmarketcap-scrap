import puppeteer, { Page } from "puppeteer";
import fs from "fs";

const scrollDelay = 100; // Kaydırma gecikmesi (ms)
const scrollStep = 100; // Kaydırma adımı (px)
const scrollDuration = 10000; // Kaydırma süresi (ms)

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://coinmarketcap.com/");
  await page.waitForSelector(".sc-beb003d5-3");

  await scroll(page)

  const datas = await page.$$eval(".sc-beb003d5-3 tbody tr", (e) =>
    e.map((data) => {
      const coinLogo = data.querySelector("img.coin-logo")?.getAttribute("src");
      const link =
        "https://coinmarketcap.com" +
        data.querySelector("a")?.getAttribute("href");
      const name = data.querySelector(".kKpPOn")?.textContent;
      const symbol = data.querySelector("p.coin-item-symbol")?.textContent;
      const price = data.querySelector(".clgqXO a span")?.textContent;
      const marketCap = data.querySelector(
        "span.sc-edc9a476-1.gqomIJ"
      )?.textContent;

      return {
        name,
        symbol,
        coinLogo,
        link,
        price,
        marketCap,
      };
    })
  );

  console.log(datas);

  await browser.close();

  const datasJSON = JSON.stringify(datas, null, 2);
  fs.writeFileSync("datas.json", datasJSON);
  console.log("datas JSON dosyasına yazıldı: datas.json");
})();

async function scroll(page: Page) {
  const pageHeight = await page.evaluate(() => {
    return document.documentElement.scrollHeight;
  });
  let scrollDistance = 0;

  const scrollInterval = setInterval(() => {
    const remainingHeight = pageHeight - scrollDistance;
    const scrollAmount = Math.min(scrollStep, remainingHeight);

    page.evaluate((amount) => {
      window.scrollBy(0, amount);
    }, scrollAmount);

    scrollDistance += scrollAmount;

    if (scrollDistance >= pageHeight) {
      clearInterval(scrollInterval);
    }
  }, scrollDelay);

  await new Promise((r) => setTimeout(r, scrollDuration));
  clearInterval(scrollInterval);
}
