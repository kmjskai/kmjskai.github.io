# 个人网站技术设计

网站采用 Astro 静态输出，发布到 GitHub Pages。首页与作品目录共享 Base 布局和 Gallery 组件；AI 地图有独立的深色页面和移动端布局。

| 路径 | 作用 |
| --- | --- |
| `/` | 个人问候、头像、小红书身份入口、作品画廊 |
| `/works/` | 作品目录 |
| `/ai-map/` | 五步 AI 概念交互地图 |

## 源码与数据

- `src/pages/`：公开路由；`src/layouts/Base.astro`：共享页眉页脚。
- `src/components/Gallery.astro`、`src/scripts/portfolio.ts`：循环卡片墙、暂停、链接与移动端滑动。
- `src/data/ai-map.ts`：13 个概念、14 个有向关系、五步桌面/手机布局及资料入口。
- `src/scripts/cosmos.ts`：Three.js 星图、GSAP 切换、节点选择和同源关系面板。
- `public/`：头像、SVG 示意封面、CNAME；封面不冒充软件截图。

地图将归属/类别、采用/调用、行动/观察分开表达。点击节点替换说明面板，不叠加重复解释。图中内容是关键概念关系，不是完整 AI 分类。

## 交互约束

倾斜卡片墙使用整体透视变换，但不启用 preserve-3d。背景容器不接收指针，只有链接恢复 pointer-events:auto。悬停使用阴影、边框、亮度与箭头，不改变可见外框的位置和大小。手机使用原始作品链接的横向滑动列表，减少动态效果时停止装饰动画。

## 构建与发布

`npm ci` 安装锁定依赖，`npm run build` 生成 `dist/`。GitHub Actions 仅在 main 发布，并用 github-pages 环境完成 Pages 部署。保留 `kmjskai.com` 域名与 HTTPS，不修改 DNS。

`prepare-preview.mjs` 只是早期本地视觉辅助，不替代 Astro 构建。根目录旧 HTML 为历史文件。线上只发布 dist，不发布本地诊断页、日志、截图和 node_modules。

## 验证边界

本地构建、桌面与 360/390px 嵌入视口已检查；用户确认风格、地图内容及小红书入口。嵌入视口不等于手机真机验收。后续增加作品或修改关系时，检查布局越界、链接和概念方向，再验证 Pages 发布结果。
