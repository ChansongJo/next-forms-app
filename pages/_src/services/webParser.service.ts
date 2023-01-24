import { parse, Options, HTMLElement } from 'node-html-parser';
import * as fs from 'fs'
import { ignoreTags } from '../constants/tag';
import { fetchHtml, fetchHtmlWithHeadless } from '../utils/fetcher';
import { extractBlocks } from '../utils/block';

const defaultInvisibleSelectors = [
  "a[role='button']",
  "a[href^='#']",
  "[role='presentation']",
  "[aria-hidden='true']"
]

// TODO. multi-depth ul, ol 처리

interface WebParserDto {
  url: string
  runPuppeteer: boolean
}


const parserOption: Partial<Options> = {
  lowerCaseTagName: false,  // convert tag name to lower case (hurts performance heavily)
  comment: false,            // retrieve comments (hurts performance slightly)
  voidTag: {
    tags: ignoreTags,	// optional and case insensitive, default value is ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
    closingSlash: true    // optional, default false. void tag serialisation, add a final slash <br/>
  },
  blockTextElements: {
    script: false,	// keep text content when parsing
    noscript: false,	// keep text content when parsing
    style: false,		// keep text content when parsing
    pre: true			// keep text content when parsing
  }
}


export async function webParser(url: string, runPuppeteer: boolean) {
  let blocks: string[] = []

  try {
    // fetch and parse body
    let root: HTMLElement;
    let html: string;
    let invisibleSelectors: string[] = defaultInvisibleSelectors
    if (runPuppeteer) {
      let _invisibleSelectors
      [html, _invisibleSelectors] = await fetchHtmlWithHeadless(url)
      invisibleSelectors = [...invisibleSelectors, ..._invisibleSelectors]
    } else {
      html = await fetchHtml(url)
    }
    fs.writeFileSync('./output.html', html);
    // 전처리
    html = html.replace("<br>", "\n")
    root = parse(html, {});

    const body = root.querySelector('body');
    // exctract block
    if (body) {

      // KBS: em class="tit"
      // SBS: span itemprop="headline"
      // MBC: span class="tit ellipsis2"
      const testElems = []
      const targetTags = [
        "em[class='tit']",
        "span[class='tit ellipsis2']",
        "span[itemprop='headline']",
        "a[class='title_cr']"
      ]
      for (const tag of targetTags) {
        const testStr = body.querySelectorAll(tag)
        testElems.push(...testStr)
      }

      // console.log('snip', testElems.map((item) => item.text))
  
      blocks = testElems.
        map((block) => block.text.trim()).
        filter((block) => block.length > 0)
      
      const blockDedup = new Set(blocks)
      blocks = Array.from(blockDedup)
      console.log(blocks.length)
      // fs.writeFileSync('./output.json', JSON.stringify(blocks, null, 4));

    }

  } catch (e) {
    console.log(e)
  }
  return blocks
}
