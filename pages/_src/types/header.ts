import { Node, HTMLElement } from 'node-html-parser';

export class Header {
  constructor(
    public h1: string = "",
    public h2: string = "",
    public h3: string = "",
    public h4: string = "",
    public h5: string = "",
    public h6: string = ""
  ) { }

  setH1(h1: string) {
    this.h1 = h1
    this.h2 = this.h3 = this.h4 = this.h5 = this.h6 = ""
  }

  setH2(h2: string) {
    this.h2 = h2
    this.h3 = this.h4 = this.h5 = this.h6 = ""
  }

  setH3(h3: string) {
    this.h3 = h3
    this.h4 = this.h5 = this.h6 = ""
  }

  setH4(h4: string) {
    this.h4 = h4
    this.h5 = this.h6 = ""
  }

  setH5(h5: string) {
    this.h5 = h5
    this.h6 = ""
  }

  setH6(h6: string) {
    this.h6 = h6
  }

  clone(): Header {
    return new Header(this.h1, this.h2, this.h3, this.h4, this.h5, this.h6)
  }

  text(): string {
    const headerList = [this.h1, this.h2, this.h3, this.h4, this.h5, this.h6].
      filter((each) => each.trim().length > 0)
    return headerList?.join(" / ") ?? ""
  }
}

/**
 * 헤더를 세팅한다.
 */
export function setHeader(node: Node, header: Header): void {
  const title = node.text.trim()
  switch ((node as HTMLElement).rawTagName) {
    case 'h1':
      header.setH1(title)
      break
    case 'h2':
      header.setH2(title)
      break
    case 'h3':
      header.setH3(title)
      break
    case 'h4':
      header.setH4(title)
      break
    case 'h5':
      header.setH5(title)
      break
    case 'h6':
      header.setH6(title)
      break
  }
}