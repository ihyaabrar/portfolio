import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const GITHUB_USER = 'ihyaabrar'
const REPO_FALLBACK = 32 // last known count, used when the build has no network

async function repoCount() {
  try {
    const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : undefined
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers, signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(String(res.status))
    const { public_repos } = (await res.json()) as { public_repos: number }
    return public_repos
  } catch (e) {
    console.warn(`[repo count] GitHub API unavailable (${e}), using ${REPO_FALLBACK}`)
    return REPO_FALLBACK
  }
}

/**
 * Link previews (WhatsApp, LinkedIn, X) need absolute URLs. SITE_URL wins; on Vercel the production
 * domain is exposed as VERCEL_PROJECT_PRODUCTION_URL. Without either, og:url is dropped and og:image stays relative.
 */
function siteUrl(): Plugin {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url = (process.env.SITE_URL || (host ? `https://${host}` : '')).replace(/\/$/, '')
  return {
    name: 'site-url',
    transformIndexHtml(html) {
      if (url) return html.replaceAll('__SITE_URL__', url)
      return html.replace(/^.*og:url.*\r?\n/m, '').replaceAll('__SITE_URL__', '')
    },
  }
}

export default defineConfig(async () => ({
  plugins: [react(), siteUrl()],
  define: { __REPO_COUNT__: JSON.stringify(await repoCount()) },
}))
