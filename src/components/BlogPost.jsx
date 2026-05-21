import React from "react";
import { useParams, Link } from "react-router-dom";
import posts from "virtual:posts";

const categories = {
  "ai-llm": { name: "AI/LLM 开发实践", color: "var(--neon-cyan)" },
  "project": { name: "项目实战记录", color: "var(--neon-pink)" },
};

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

        <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

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
