import moment from "moment";
import puppeteer, { ElementHandle } from "puppeteer";

export async function login(
  page: puppeteer.Page,
  accessNumber: string,
  password: string
) {
  await page.setViewport({
    height: 900,
    width: 1440
  });

  await page.goto("https://secure.bnz.co.nz/auth/personal-login");
  await page.type('input[name="principal"]', accessNumber);
  await page.type('input[name="credentials"]', password);
  await page.keyboard.press("Enter");
  await page.waitForSelector("span.js-main-menu-button-text");
}

export async function getAccountButton(
  page: puppeteer.Page,
  accountName: string
): Promise<ElementHandle | undefined> {
  const accounts = await page.$x(
    `//h3[@title='${accountName}']/ancestor::div[contains(@class, ' js-account ')]`
  );
  return accounts[0];
}

export async function getAccountID(page: puppeteer.Page, accountName: string) {
  const account = await getAccountButton(page, accountName);
  if (account) {
    const id: string = await page.evaluate(
      (el: HTMLDivElement) => el.dataset.dragId,
      account
    );
    return id;
  }

  return null;
}

export async function openAccount(
  page: puppeteer.Page,
  accountName: string
): Promise<boolean> {
  const account = await getAccountButton(page, accountName);

  if (account) {
    await account.click();
    return true;
  }

  return false;
}

export async function closeAccount(page: puppeteer.Page) {
  await page.click("span.js-close-modal-button");
}

export async function exportAccount(
  page: puppeteer.Page,
  accountName: string,
  fromDate: string = moment()
    .subtract(3, "days")
    .format("YYYY-MM-DD"),
  toDate: string = moment().format("YYYY-MM-DD")
): Promise<string | null> {
  const accountID = await getAccountID(page, accountName);
  const exportURL =
    `https://www.bnz.co.nz/ib/api/accounts/${accountID}/` +
    `transactions/export/legacy?` +
    `fromDate=${fromDate}&` +
    `toDate=${toDate}&` +
    `format=O`;

  const resp = (await page.evaluate(async url => {
    const res = await fetch(url, {
      credentials: "same-origin"
    });

    const body = await res.text();
    return body;
  }, exportURL)) as string;

  return Buffer.from(JSON.parse(resp), "base64").toString();
}
