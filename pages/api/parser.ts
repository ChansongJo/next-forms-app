import type { NextApiRequest, NextApiResponse } from 'next'
import { webParser } from '../_src/services/webParser.service'

type ResponseData = {
  data: unknown
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { url, runPuppeteer } = req.body

  const result = await webParser(url, runPuppeteer)

  // Found the name.
  res.json({ data: [ ...result ] })
}
