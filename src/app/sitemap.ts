import { MetadataRoute } from 'next'

export const dynamic = "force-static"

const baseUrl = 'https://preethamnimmagadda.github.io'

/** Path and crawl priority for every entry; all change monthly. */
const PAGES: [path: string, priority: number][] = [
  ['', 1],
  ['/#about', 0.8],
  ['/#projects', 0.8],
  ['/#experience', 0.7],
  ['/#achievements', 0.7],
  ['/#contact', 0.6],
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PAGES.map(([path, priority]) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
  }))
}
