import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import posts from "virtual:posts";

const categories = {
  "ai-llm": { name: "AI/LLM 开发实践", color: "var(--neon-cyan)" },
  "aillm项目实践": { name: "AI/LLM 项目实践", color: "var(--neon-cyan)" },
  "project": { name: "项目实战记录", color: "var(--neon-pink)" },
};

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  // 切换分类后，激活新渲染的 .reveal 元素
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.blog-card.reveal:not(.active)').forEach((el) => {
        el.classList.add('active');
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  const filteredPosts = activeCategory === "all"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <section className="section-padding blog-section">
      <div className="bg-text font-cyber" style={{ color: "rgba(0,243,255,0.03)" }}>
        BLOG
      </div>
      <h2
        className="section-title font-cyber"
        style={{ color: "var(--neon-cyan)" }}
      >
        NEURAL_LOG // 开发笔记
      </h2>

      {/* 分类筛选 */}
      <div className="blog-categories">
        <button
          className={`category-btn font-cyber ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          ALL
        </button>
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            className={`category-btn font-cyber ${activeCategory === key ? "active" : ""}`}
            style={{
              "--cat-color": cat.color,
              borderColor: activeCategory === key ? cat.color : "var(--text-muted)",
              color: activeCategory === key ? cat.color : "var(--text-muted)",
            }}
            onClick={() => setActiveCategory(key)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 文章列表 */}
      <div className="blog-grid">
        {filteredPosts.map((post, index) => (
          <Link
            to={`/blog/${post.id}`}
            key={post.id}
            className="blog-card card reveal"
            style={{ transitionDelay: `${index * 0.1}s`, textDecoration: "none" }}
          >
            <span
              className="card-id font-cyber"
              style={{ color: categories[post.category]?.color || "var(--neon-cyan)" }}
            >
              {post.category.toUpperCase()} // {post.date}
            </span>
            <h3 className="font-cyber">{post.title}</h3>
            <p>{post.summary}</p>
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="blog-tag font-cyber">
                  #{tag}
                </span>
              ))}
            </div>
            <span className="blog-read-more font-cyber">
              READ_MORE &gt;&gt;
            </span>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "60px" }}>
          [ NO_DATA_FOUND ] 该分类暂无文章
        </p>
      )}
    </section>
  );
};

export default Blog;
