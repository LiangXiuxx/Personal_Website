import React from "react";
import { useParams, Link } from "react-router-dom";
import posts, { categories } from "../data/posts";

const BlogPost = () => {
  const { id } = useParams();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <section className="section-padding blog-section">
        <div className="blog-post-not-found">
          <h2 className="font-cyber" style={{ color: "var(--neon-pink)" }}>
            ERROR_404 // 数据未找到
          </h2>
          <p>请求的神经档案不存在或已被删除。</p>
          <Link to="/blog" className="btn-glitch font-cyber" style={{ display: "inline-block", marginTop: "30px" }}>
            &lt;&lt; RETURN_TO_LOG
          </Link>
        </div>
      </section>
    );
  }

  const cat = categories[post.category];

  const renderContent = (content) => {
    const lines = content.split("\n");
    const elements = [];
    let inCodeBlock = false;
    let codeLines = [];
    let listItems = [];
    let listType = null;

    const flushList = () => {
      if (listItems.length > 0) {
        const Tag = listType === "ol" ? "ol" : "ul";
        elements.push(
          <Tag key={`list-${elements.length}`} className="blog-list">
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            ))}
          </Tag>
        );
        listItems = [];
        listType = null;
      }
    };

    const inlineFormat = (text) => {
      return text
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${elements.length}`} className="blog-code-block">
              <code>{codeLines.join("\n")}</code>
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h4 key={`h4-${i}`} className="blog-h3 font-cyber">{line.slice(4)}</h4>
        );
        continue;
      }
      if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="blog-h2 font-cyber">{line.slice(3)}</h3>
        );
        continue;
      }

      if (line.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote key={`quote-${i}`} className="blog-quote">{line.slice(2)}</blockquote>
        );
        continue;
      }

      if (line.trim().startsWith("- ")) {
        if (listType !== "ul") flushList();
        listType = "ul";
        listItems.push(line.trim().slice(2));
        continue;
      }

      const olMatch = line.trim().match(/^\d+\.\s(.+)/);
      if (olMatch) {
        if (listType !== "ol") flushList();
        listType = "ol";
        listItems.push(olMatch[1]);
        continue;
      }

      flushList();
      if (line.trim() === "") continue;

      elements.push(
        <p key={`p-${i}`} className="blog-paragraph" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
      );
    }

    flushList();
    return elements;
  };

  return (
    <section className="section-padding blog-section">
      <div className="blog-post-container">
        <Link to="/blog" className="blog-back-link font-cyber">
          &lt;&lt; BACK_TO_LOG
        </Link>

        <div className="blog-post-header">
          <span className="card-id font-cyber" style={{ color: cat?.color || "var(--neon-cyan)" }}>
            {post.category.toUpperCase()} // {post.date}
          </span>
          <h1 className="blog-post-title font-cyber">{post.title}</h1>
          <div className="blog-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="blog-tag font-cyber">#{tag}</span>
            ))}
          </div>
        </div>

        <div className="blog-post-body">
          {renderContent(post.content)}
        </div>

        <div className="blog-post-footer">
          <Link to="/blog" className="btn-glitch font-cyber" style={{ display: "inline-block" }}>
            &lt;&lt; RETURN_TO_LOG
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPost;
