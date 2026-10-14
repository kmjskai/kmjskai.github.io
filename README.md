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

## 发布边界

本次只保存本地开发分支，不推送、不部署。仓库原有根目录 `index.html` 与 `CNAME` 保留，原 GitHub Pages 页面未改动。后续发布 Astro 的 `dist/` 需另行配置构建发布流程；`public/CNAME` 用于在构建产物中保留域名。

## 画廊交互

画廊保留倾斜透视、行滚动、悬停暂停及高亮箭头。背景容器不接收鼠标事件，卡片链接显式接收事件；不使用 preserve-3d 或悬停几何位移，避免背景平面截获点击及可见区域与点击范围错位。

此前完整画廊对照测试中，旧样式在两张卡片内部 98 个采样点中有 44 个错误命中背景平面，修复后 98/98 正确命中。卡片中心与上下边缘连续点击、实际进入 AI 地图通过。用户已确认整体风格可保留。
