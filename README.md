# 凯门见山Kai个人网站

Astro 静态网站源码，包含个人首页、作品画廊和 Three.js AI 地图。

- `/`：个人首页与作品画廊。
- `/works/`：作品目录。
- `/ai-map/`：AI 概念交互地图，内容仍在迭代。

## 开发

```sh
npm install
npm run dev
npm run build
npm run preview
```

`src/` 为页面、组件、样式和交互源码；`public/` 为静态资源。四件作品的 SVG 封面为原创示意图，不是软件界面截图。

## 本地预览辅助

`node prepare-preview.mjs` 可生成 `local-preview/`，用于已知模板的轻量视觉预览；该脚本不替代 Astro 构建。它使用 Node 的 TypeScript 类型移除功能，并由浏览器从固定版本 esm.sh 地址加载 Three.js 和 GSAP。`tools/mobile-preview.html` 为手机尺寸检查工具，不属于正式页面。

## 发布

正式入口为 https://kmjskai.com/，AI 地图为 https://kmjskai.com/ai-map/。

GitHub Pages 使用 GitHub Actions：推送 `main` 后，`.github/workflows/deploy.yml` 在 Node 24 上安装锁定依赖、构建 Astro，并发布 `dist/`。确认 Actions 中构建和部署均成功后，再检查线上页面。`public/CNAME` 在构建产物中保留域名；DNS 与 HTTPS 继续由现有 Spaceship / GitHub Pages 配置承接。

日常修改使用功能分支，本地 `npm run build` 检查通过后合入 `main`。原根目录 `index.html` 是迁移前的历史入口，不是当前页面源码；不要再通过编辑它更新首页。网站结构见 [技术设计](docs/technical-design.md)，本次迁移与失败证据见 [开发记录](docs/development-records/2026-10-14-personal-site.md)。

## 画廊交互

画廊保留倾斜透视、行滚动、悬停暂停及高亮箭头。背景容器不接收鼠标事件，卡片链接显式接收事件；不使用 preserve-3d 或悬停几何位移，避免背景平面截获点击及可见区域与点击范围错位。

此前完整画廊对照测试中，旧样式在两张卡片内部 98 个采样点中有 44 个错误命中背景平面，修复后 98/98 正确命中。卡片中心与上下边缘连续点击、实际进入 AI 地图通过。用户已确认整体风格可保留。

## AI 地图内容

首页与画廊的风格基线保存于 `acf29f3`。用户已确认 AI 地图内容及首页小红书入口。

概念、关系、五步布局和资料入口统一保存在 `src/data/ai-map.ts`。关系明确区分归属/模型类别、采用/调用、行动/观察；箭头从主语指向对象。地图和侧栏由同一份关系数据生成。加入决策树、深层神经网络与视觉任务作为具体对照。点击节点直接替换说明面板，可返回当前步骤，不叠加重复说明。

内容参考 AIMA 第 1 章、Deep Learning 第 1 章，以及 Transformer、GPT-3、ViT 原论文；网页面板内可展开对应链接。“网页助手”是用于解释观察和行动的示例。该图展示所选概念的关键关系，不是完整的 AI 领域分类。

已运行正式 Astro 构建、关系端点与五步桌面/手机布局一致性检查；桌面以及 360/390px 嵌入视口的五步节点无越界、页面无横向溢出。手机真机体验仍需用户验收。

首页问候下保留“小红书 · 凯门见山Kai ↗”入口，链接到用户指定的个人主页，在新标签页打开。
