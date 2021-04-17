const puppeteer = require("puppeteer");
const telegramApi = require("./telegram-api");

const SASSY_BEAST_SUIT_URL =
  "https://myairblaster.com/products/womens-sassy-beast-suit";
const SIZE = "S";

const sendUpdate = async (itemAvailabilities) => {
  const formattedItemAvailabilities = itemAvailabilities.map(
    ({ colorName, isItemInStock }) => {
      return `${colorName} color is${isItemInStock ? "" : " not"} in stock.`;
    }
  );
  const formattedMessage = formattedItemAvailabilities.join("\n");
  const { data } = await telegramApi.sendMessage(formattedMessage);
  return data;
};

(async () => {
  try {
    // to run locally, pass following object as arg to launch()
    // {
    //  executablePath: "/usr/local/bin/chromium",
    // }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(SASSY_BEAST_SUIT_URL);

    const getIsItemInStock = (colorOptionElement) =>
      page.evaluate(
        async (colorOptionEl, SIZE) => {
          const colorName = colorOptionEl.getAttribute("data-color-name");

          // select color variant to check
          const colorOptionLink = document.querySelector(
            `[data-color-name="${colorName}"]`
          );
          await colorOptionLink.click();

          // select correct size
          const desiredSizeOption = document.querySelector(
            `#SingleOptionSelector-1 > option[value="${SIZE}"]`
          );
          desiredSizeOption.selected = true;

          // check if add to cart button is disabled or not
          const submitButton = document.querySelector('[name="add"]');
          const isItemInStock = !submitButton.disabled;

          return {
            colorName,
            isItemInStock,
          };
        },
        colorOptionElement,
        SIZE
      );

    const itemAvailabilities = [];

    const colorOptionElementsLength = (await page.$$("a.js-color-option"))
      .length;

    for (let i = 0; i < colorOptionElementsLength; i++) {
      const colorOptionElement = (await page.$$("a.js-color-option"))[i];
      const variantAvailability = await getIsItemInStock(colorOptionElement);
      itemAvailabilities.push(variantAvailability);
    }

    await sendUpdate(itemAvailabilities);

    await page.close();
    browser.close();
  } catch (error) {
    console.error(error);
  }

  process.exit();
})();
