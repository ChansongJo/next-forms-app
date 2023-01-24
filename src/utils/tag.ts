import { HTMLElement, Node, NodeType } from 'node-html-parser'
import { blockTags, descriptionTags, headerTags, ignoreTags, listTags } from '../constants/tag'


export function isIgnoreTag(node: HTMLElement): boolean {
  return ignoreTags.includes(node.rawTagName)
}

export function isTextNode(node: Node): boolean {
  return node.nodeType === NodeType.TEXT_NODE
}

export function isBlockTag(node: HTMLElement): boolean {
  return blockTags.includes(node.rawTagName)
}

export function isNotBlockTag(node: HTMLElement): boolean {
  return !isBlockTag(node)
}

export function isHeaderTag(node: HTMLElement): boolean {
  return headerTags.includes(node.rawTagName)
}

export function isListTag(node: HTMLElement): boolean {
  return listTags.includes(node.rawTagName)
}

export function isDescriptionTag(node: HTMLElement): boolean {
  return descriptionTags.includes(node.rawTagName)
}

