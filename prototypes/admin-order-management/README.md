# SunPower Partner Portal Operations Admin

运营后台原型包含 Partner Portal → Order Management 下的 Order Overview、Delivery Overview，以及 Partner Portal → User Management 下的 Credit Overview。

- 线上页面：https://nickiisme.github.io/product-list/admin-order-management/
- 完整 PRD：[My Orders 与运营后台需求文档](../../docs/SunPower_My_Orders_PRD.md)
- GitHub Pages 发布目录：`site/admin-order-management/`。

页面使用示例数据。查询、导出、只读订单抽屉、关联 DN、文字下载入口与固定操作区用于需求评审；真实新方舟 API、认证、信用权限及文件下载尚未接入。具体实现边界见 PRD 第 13.3 节。

## 本地开发

需要 Node.js 与 npm。

```sh
npm ci
npm run dev
```

## 构建 GitHub Pages 资源

```sh
npm run build:github
```

将生成的 `dist/github-pages/` 内容同步到仓库 `site/admin-order-management/`，推送到 main 后由已有 GitHub Pages 工作流发布。该构建使用相对资源路径，兼容仓库站点的子目录。

`build` / `test:sites` 以及 worker 脚本保留原型的 Sites 构建兼容性；GitHub Pages 使用 `build:github`。
