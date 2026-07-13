import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

const VIRTUAL_MODULE_ID = 'virtual:posts'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

// 配置 marked 使用网站的 CSS 类名
const renderer = {
  heading({ tokens, depth }) {
    const text = this.parser.parseInline(tokens)
    if (depth === 2) return `<h3 class="blog-h2 font-cyber">${text}</h3>`
    if (depth === 3) return `<h4 class="blog-h3 font-cyber">${text}</h4>`
    return `<h${depth}>${text}</h${depth}>`
  },
  paragraph({ tokens }) {
    const text = this.parser.parseInline(tokens)
    return `<p class="blog-paragraph">${text}</p>`
  },
  code({ text, lang }) {
    return `<pre class="blog-code-block"><code>${text}</code></pre>`
  },
  codespan({ text }) {
    const colors = ['cyan', 'pink', 'purple']
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i)
      hash |= 0
    }
    const color = colors[Math.abs(hash) % colors.length]
    return `<code class="inline-code inline-code-${color}">${text}</code>`
  },
  strong({ tokens }) {
    const text = this.parser.parseInline(tokens)
    return `<strong>${text}</strong>`
  },
  em({ tokens }) {
    const text = this.parser.parseInline(tokens)
    return `<em>${text}</em>`
  },
  list(token) {
    const tag = token.ordered ? 'ol' : 'ul'
    const body = token.items.map(item => {
      const text = this.parser.parse(item.tokens)
      return `<li>${text}</li>`
    }).join('')
    return `<${tag} class="blog-list">${body}</${tag}>`
  },
  blockquote({ tokens }) {
    const body = this.parser.parse(tokens)
    return `<blockquote class="blog-quote">${body}</blockquote>`
  },
  table(token) {
    const header = token.header.map(cell => {
      const text = this.parser.parseInline(cell.tokens)
      const align = cell.align ? ` style="text-align:${cell.align}"` : ''
      return `<th${align}>${text}</th>`
    }).join('')

    const rows = token.rows.map(row => {
      const cells = row.map(cell => {
        const text = this.parser.parseInline(cell.tokens)
        const align = cell.align ? ` style="text-align:${cell.align}"` : ''
        return `<td${align}>${text}</td>`
      }).join('')
      return `<tr>${cells}</tr>`
    }).join('')

    return `<div class="blog-table-wrap"><table class="blog-table"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`
  },
  link({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens)
    const titleAttr = title ? ` title="${title}"` : ''
    return `<a href="${href}"${titleAttr}>${text}</a>`
  },
  image({ href, title, text }) {
    const titleAttr = title ? ` title="${title}"` : ''
    return `<img src="${href}" alt="${text}"${titleAttr}>`
  },
  hr() {
    return `<hr>`
  },
}

marked.use({ renderer })

export default function postsPlugin() {
  const postsDir = path.resolve(process.cwd(), 'posts')

  function loadPosts() {
    if (!fs.existsSync(postsDir)) return []

    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))

    return files.map(file => {
      const filePath = path.join(postsDir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)

      return {
        id: data.id || file.replace(/\.md$/, ''),
        title: data.title || 'Untitled',
        date: data.date || '',
        updated: data.updated || '',
        category: data.category || 'uncategorized',
        tags: data.tags || [],
        summary: data.summary || '',
        contentHtml: marked(content.trim(), { breaks: true }),
      }
    }).sort((a, b) => b.date.localeCompare(a.date))
  }

  return {
    name: 'vite-plugin-posts',

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const posts = loadPosts()
        return `export default ${JSON.stringify(posts, null, 2)}`
      }
    },

    configureServer(server) {
      const isPostFile = (file) => {
        const resolved = path.resolve(file)
        return path.extname(resolved) === '.md' && path.dirname(resolved) === postsDir
      }

      const reloadPosts = (file) => {
        if (!isPostFile(file)) return

        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.add(postsDir)
      server.watcher.on('add', reloadPosts)
      server.watcher.on('change', reloadPosts)
      server.watcher.on('unlink', reloadPosts)
    },
  }
}
