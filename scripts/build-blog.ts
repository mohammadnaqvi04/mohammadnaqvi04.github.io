import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const POSTS_DIR = join(ROOT, "blog", "posts");
const OUT_DIR = join(ROOT, "blog");

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  html: string;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function postPage(post: Post): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
  <link rel="stylesheet" href="../css/styles.css">
  <style>
    body, html {
      min-height: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      background-color: #FFFCF6;
      margin: 0;
      padding: 20px 0;
    }

    .post-page {
      width: 90%;
      padding: 40px 56px;
      background-color: #fff;
      box-shadow: 0px 0px 15px rgba(0,0,0,0.1);
      border-radius: 10px;
      margin: 20px;
    }
  </style>
</head>
<body>
  <div class="post-page">
    <a class="back-link" href="../blog.html" data-link>&larr; All posts</a>
    <div class="date">${formatDate(post.date)}</div>
    <h1>${post.title}</h1>

    <div class="post-body">
${post.html}
    </div>
  </div>
</body>
</html>
`;
}

function blogIndex(posts: Post[]): string {
  const entries = posts
    .map(
      (post) => `          <div class="post-entry">
            <div class="date">${formatDate(post.date)}</div>
            <a class="post-title" href="blog/${post.slug}.html" data-link>${post.title}</a>${
              post.excerpt ? `\n            <p class="excerpt">${post.excerpt}</p>` : ""
            }
          </div>`
    )
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="container">
    <div class="right-side">
      <div class="content">
        <a class="back-link" href="index.html" data-link>&larr; Home</a>
        <h1>Blog</h1>

        <div class="post-list">
${entries}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

function build(): void {
  mkdirSync(POSTS_DIR, { recursive: true });

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  const posts: Post[] = files.map((file) => {
    const raw = readFileSync(join(POSTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    if (!data.title || !data.date) {
      throw new Error(`${file}: frontmatter must include "title" and "date"`);
    }

    const rawDate = data.date;
    const date =
      rawDate instanceof Date
        ? rawDate.toISOString().slice(0, 10)
        : String(rawDate);

    return {
      slug: file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""),
      title: String(data.title),
      date,
      excerpt: data.excerpt ? String(data.excerpt) : undefined,
      html: marked.parse(content, { async: false }) as string,
    };
  });

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  for (const post of posts) {
    writeFileSync(join(OUT_DIR, `${post.slug}.html`), postPage(post));
  }

  writeFileSync(join(ROOT, "blog.html"), blogIndex(posts));

  console.log(`Built ${posts.length} post(s).`);
}

build();
