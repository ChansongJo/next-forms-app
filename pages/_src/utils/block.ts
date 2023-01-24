import { isDescriptionTag, isHeaderTag, isIgnoreTag, isListTag, isNotBlockTag, isTextNode } from '../utils/tag';
import { Block } from '../types/block';
import { Header, setHeader } from '../types/header';
import { HTMLElement, Node } from 'node-html-parser';

/**
 * 열린 블락의 컨텐츠 내용을 추가한다.
 */
export function concatContentsToBlockOpened(blocks: Block[], node: Node): void {
  const textCleaned: string = node.text.replaceAll("\n", "").replaceAll("\r", "").replaceAll("\t", " ")
  blocks[blocks.length - 1].contents += textCleaned
}

/**
 * 열린 블락을 닫고, 새로운 블락을 연다.
 */
export function closeBlockAndOpenNew(blocks: Block[], newHeader: Header): void {
  const newBlock: Block = {
    header: newHeader.clone(),
    contents: '',
  }
  blocks.push(newBlock)
}

/**
 * 블락을 추출한다.
 */
export function extractBlocks(node: HTMLElement | Node, header: Header = new Header()): Block[] {
  const blocks: Block[] = [{
    header: header,
    contents: ''
  }]

  for (const child of node.childNodes) {
    if (isIgnoreTag(child as HTMLElement)) {
      continue
    }

    if (isHeaderTag(child as HTMLElement)) {
      setHeader(child, header)
      closeBlockAndOpenNew(blocks, header)
      continue
    }

    if (isTextNode(child) || isNotBlockTag(child as HTMLElement)) {
      concatContentsToBlockOpened(blocks, child)
      continue
    }

    // block tag 일 경우
    if (isListTag(child as HTMLElement)) {
      blocks[blocks.length - 1].contents += `\n${extractContentsFromListTag(child as HTMLElement)}`
      continue
    }

    let newBlocks: Block[] = []
    if (isDescriptionTag(child as HTMLElement)) {
      newBlocks = [{
        header: header.clone(),
        contents: extractContentsFromDescriptionTag(child as HTMLElement)
      }]
    } else {
      newBlocks = extractBlocks(child, header.clone())
    }

    if (newBlocks.length > 0) {
      blocks.push(...newBlocks)

      // update header
      header = blocks[blocks.length - 1].header.clone()
      closeBlockAndOpenNew(blocks, header)
    }

  }

  return blocks
}


/**
 * 리스트형 태그에서 컨텐츠를 추출한다.
 */
export function extractContentsFromListTag(node: HTMLElement): string {
  let contentsList: string[] = []
  // Currently, only "1-depth list" supported
  for (const child of node.childNodes) {
    if ((child as HTMLElement).rawTagName == "li") {
      contentsList.push(child.text.trim())
    }
  }
  contentsList = contentsList.filter((listItem) => listItem.length > 0)

  if (node.rawTagName === "ul") {
    contentsList = contentsList.map((listItem) => `• ${listItem}`)
  } else {
    contentsList = contentsList.map((listItem, idx) => `${idx + 1}. ${listItem}`)
  }

  return contentsList.join("\n")
}

/** 
 * Description형 태그에서 컨텐츠를 추출한다.
 */
export function extractContentsFromDescriptionTag(node: HTMLElement): string {
  let contents: string = ""
  for (const child of node.childNodes) {
    if ((child as HTMLElement).rawTagName == "dt") {
      contents += `${child.text.trim()}: `
    } else if ((child as HTMLElement).rawTagName == "dd") {
      contents += child.text.replaceAll("\n", "").replaceAll("\r", "")
    }
  }
  return contents
}

