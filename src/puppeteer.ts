import puppeteer from "puppeteer";

const isProduction = process.env.NODE_ENV === "production";

export const setupPage = () =>
  puppeteer
    .launch(
      isProduction
        ? {
            args: ["--disable-dev-shm-usage", "--no-sandbox"],
          }
        : {
            headless: "new",
          },
    )
    .then(browser =>
      browser.newPage().then(page => ({
        browser,
        page,
      })),
    );
