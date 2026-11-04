# vlas. · 个人作品集网站

vlas 的中英双语设计作品集，带一个可视化的案例管理后台。

- 前台：Astro 5 静态站点，中文在 `/`，英文在 `/en/`
- 后台：Keystatic，地址 `/keystatic`，可管理案例、分类与站点信息
- 部署：Vercel（页面全部静态生成，只有后台路由在服务端运行）

![首页](docs/screenshots/home-zh-1440.png)

## 本地运行

需要 Node.js 20 及以上版本。

```bash
npm install
npm run dev        # http://localhost:4321，后台在 http://localhost:4321/keystatic
npm run build      # 生产构建
npm run check      # 类型检查
```

本地开发时后台使用 local 模式，保存后直接写入仓库里的文件，然后用 git 提交即可。草稿状态的案例在本地也能预览，线上不会显示。

## 用后台管理内容

打开 `/keystatic`，左侧有三组菜单。

| 菜单 | 用途 |
| --- | --- |
| 案例 Projects | 新增、编辑、排序、下架案例 |
| 分类 | 设计领域、平台 / 媒介、行业、项目性质，四组分类都可以增删改 |
| 站点设置 | 邮箱、是否可接项目、所在地、关于页介绍、服务、经历、客户、社交链接、简历 PDF |

**新增一个案例**

1. 进入「案例 Projects」，点 Add。
2. 填写内部名称和 URL 标识（URL 标识就是网址里的 `/work/xxx`）。
3. 填写中英文标题、概述、挑战 / 方案 / 结果。英文留空时，英文页会显示中文并给出提示。
4. 上传封面图（16:10，或勾选「封面是竖图」使用 4:5）和主视觉（16:9）。主视觉也可以上传一段 4MB 以内的 MP4。
5. 在四组分类里勾选对应的分类，作品页的筛选会自动出现这些分类。
6. 在「正文」里按顺序添加内容块：章节（标题 + 正文）、全宽单图、左右双图、三列小图、图文左右排、客户评价。每个「章节」会自动出现在左侧目录里。
7. 状态改为「已发布」。勾选「首页精选」并调整排序，就会出现在首页（最多 6 个）。

现在的 6 个案例和图片都是占位内容，直接在后台替换即可。

## 改颜色、字体和间距

所有设计 token 都在 `src/styles/tokens.css`：

- 颜色：`--bg` `--fg` `--muted` `--line` `--accent`，深色模式在同一文件的 `prefers-color-scheme: dark` 段落里
- 字体：`--font-sans`（Inter 可变字体 + 系统中文字体）和 `--font-mono`
- 字号：`--fs-display` `--fs-h1` `--fs-h2` 等，都用 `clamp()` 随屏宽缩放
- 动效：统一缓动 `--ease` 和三档时长 `--t-micro` `--t-enter` `--t-page`

界面上的固定文字（导航、按钮、标题等）在 `src/i18n/zh.ts` 和 `src/i18n/en.ts`。

## Logo

源文件在 `src/assets/brand/`。网站里的字标是 `src/components/Logo.astro` 中的内联 SVG，颜色跟随文字色。修改 SVG 后运行 `npm run brand-assets`，会重新生成 favicon 和默认分享图。

## 部署到 Vercel

1. 在 Vercel 里导入这个 GitHub 仓库，框架选 Astro，其余保持默认。
2. 在 Environment Variables 中添加 `SITE_URL`，填你的正式域名。
3. 部署完成后，网站即可访问。后台需要完成下面的 GitHub 模式配置才能在线上使用。

## Keystatic GitHub 模式（线上后台）

线上后台用 GitHub 账号登录，保存内容时会直接提交到这个仓库，Vercel 随后自动重新部署，大约 1 分钟后生效。只需要配置一次。

1. 本地创建 `.env`，写入 `PUBLIC_KEYSTATIC_GITHUB=true`，然后运行 `npm run dev`。
2. 打开 `http://localhost:4321/keystatic`，按页面提示创建 GitHub App。完成后，Keystatic 会自动把 `KEYSTATIC_GITHUB_CLIENT_ID`、`KEYSTATIC_GITHUB_CLIENT_SECRET`、`KEYSTATIC_SECRET` 和 `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` 写进 `.env`。
3. 在 GitHub 的 App 设置里，把这个仓库加入 App 的安装范围，并在 Callback URL 中加入 `https://你的域名/api/keystatic/github/oauth/callback`。
4. 把这四个变量复制到 Vercel 的 Environment Variables，然后重新部署。
5. 本地把 `PUBLIC_KEYSTATIC_GITHUB` 改回 `false`（或删除），继续用 local 模式开发。

`.env` 已在 `.gitignore` 中，不会被提交。

## 目录结构

```
keystatic.config.ts      后台的内容模型
src/content.config.ts    前台读取内容时的字段校验
src/content/             案例、分类、站点设置（YAML，由后台写入）
src/assets/projects/     案例图片
src/i18n/                中英文界面文字
src/views/               各页面的模板，中英文路由共用
src/pages/               路由（/ 与 /en/）
src/styles/tokens.css    设计 token
```

## 许可证

代码使用 [MIT License](LICENSE)。案例文字与图片的版权归作者所有。
