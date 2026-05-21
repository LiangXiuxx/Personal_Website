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
    return `<code class="inline-code">${text}</code>`
  },
  list({ ordered, items }) {
    const tag = ordered ? 'ol' : 'ul'
    const body = items.map(item => `<li>${item.text}</li>`).join('')
    return `<${tag} class="blog-list">${body}</${tag}>`
  },
  blockquote({ tokens }) {
    const body = this.parser.parse(tokens)
    return `<blockquote class="blog-quote">${body}</blockquote>`
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
  }
}
