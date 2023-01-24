import axios from 'axios'
import puppeteer from 'puppeteer'

export async function fetchHtml(url: string): Promise<string> {
  const response = await axios.get(url)
  return response.data
}


export async function fetchHtmlWithHeadless(url: string): Promise<[string, string[]]> {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      `--window-size=1024,768`,
      '--no-sandbox'
    ],
    defaultViewport: {
      width: 1024,
      height: 768
    }
  });
  const page = await browser.newPage();

  let cssTexts: string[] = []
  page.on('response', async response => {
    if (response.request().resourceType() === 'stylesheet') {
      cssTexts.push(await response.text());
    }
  });
  await page.goto(url, { waitUntil: 'networkidle2', });

  // const invisibleSelectors = getInvisibleSelectors(cssTexts)
  // console.log('get selectors')

  const html = await page.content()
  console.log('get content')

  await browser.close();
  return [html, []]
}


interface CssPropertyValue {

  property: string
  value: string
}

const invalidCssList: CssPropertyValue[] = [
  {
    property: 'display',
    value: 'none'
  },
  {
    property: 'visibility',
    value: 'hidden'
  },
  {
    property: 'position',
    value: 'fixed'
  },
  {
    property: 'position',
    value: 'absolute'
  },
  {
    property: 'position',
    value: 'sticky'
  },
]


function getInvisibleSelectors(cssTexts: string[]): string[] {
  let invisibleSelectors: string[] = []
  for (const cssText of cssTexts) {
    for (const invalidCss of invalidCssList) {
      const regexString = `[^{}\\/]*\\s*{{1}[^{}]*${invalidCss.property}\\s*:\\s*${invalidCss.value}\\s*(?:!\\s*important){0,1}[^{}]*}{1}`
      const re = new RegExp(regexString, "g")
      const invisibleSelector = cssText.match(re)?.map((each) => each.slice(0, each.indexOf("{"))).map((each) => each.replaceAll("\r", "").replaceAll("\n", "").replaceAll("\t", "").trim())
      if (invisibleSelector != undefined) {
        invisibleSelectors = [...invisibleSelectors, ...invisibleSelector]
      }
    }
  }
  // filter-out pseudo-elements
  invisibleSelectors = invisibleSelectors.filter((each) => !(each.includes(":")))
  return invisibleSelectors
}