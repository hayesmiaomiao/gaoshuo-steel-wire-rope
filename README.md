# Gaoshuo Steel Wire Rope 项目说明

## 1. 项目介绍

这是 Gaoshuo Steel Wire Rope 的英文 B2B 询盘型网站，面向全球英语市场的进口商、工业采购商、经销商、工程承包商、设备制造商和钢丝绳组件采购商。

首版目标是建立可持续维护的网站框架、产品数据系统、内容系统、SEO 系统和询盘接口架构。所有未确认的业务事实都集中在 `knowledge/` 中，不得在前台虚构。

## 2. 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Server Components 优先
- Zod 数据校验
- React Hook Form 表单
- Markdown 内容系统
- CSV 产品数据库
- Schema.org JSON-LD
- Vitest 测试

## 3. 本地运行步骤

```bash
npm install
npm run dev
```

打开本地开发地址后即可查看首页、产品中心、应用页、能力页和询盘页。

## 4. 如何安装依赖

```bash
npm install
```

如果 PowerShell 阻止 `npm`，可使用：

```bash
npm.cmd install
```

## 5. 如何启动开发环境

```bash
npm run dev
```

## 6. 如何执行测试

```bash
npm run test
```

## 7. 如何执行完整检查

```bash
npm run verify
```

该命令会顺序执行 lint、TypeScript、产品验证、内容验证、链接检查、SEO 检查、测试和生产构建。

## 8. 如何添加产品

产品数据在 `data/products.csv`。

新增产品流程：

1. 新产品首先设置 `status=draft`。
2. 补充真实参数，不确定字段留空。
3. 运行 `npm run validate:products`。
4. 人工审核产品名称、分类、应用、图片和 SEO 信息。
5. 审核后改为 `reviewed`。
6. 如果产品来自已授权来源，完成去重、品牌替换、联系方式清理和 SEO 改写后，可设置 `verification_status=source-approved`、`publishable=true`。
7. 最终确认后改为 `published`。
8. 执行 `npm run verify`。
9. 再提交代码。

## 9. 如何发布产品

只有 `status=published`、`publishable=true`，且 `verification_status` 为 `source-approved` 或 `reviewed` 的产品才允许进入产品列表、动态产品页和 sitemap。`draft` 不会出现在正式列表，`archived` 不应被索引。

## 9.1 授权来源内容迁移规则

用户已确认一组来源网站的产品内容和服务内容可用于 Gaoshuo Steel Wire Rope。具体来源域名只保存在 `research/` 内部审计文件中，不写入前台页面、SEO 输出或生产数据。

允许迁移产品分类、产品名称、型号、规格、参数、材质、结构、涂层、端头、应用、定制选项、产品特点、FAQ、表格、服务项目、服务流程、定制能力和技术选型内容。

不得迁移原网站公司身份和联系方式，包括原公司名、品牌名、Logo、域名作为前台文案、邮箱、电话、WhatsApp、微信、传真、地址、地图、社媒、联系人、二维码、版权信息、隐私政策公司信息、表单收件邮箱和 Schema 公司信息。

图片暂不直接复用。只能把原图 URL 记录到 `research/image-migration.csv`，等待用户确认后再正式使用。

迁移记录文件：

- `research/source-pages.csv`
- `research/image-migration.csv`
- `research/url-mapping.csv`

服务迁移数据入口：

- `data/services.json`

## 10. 如何添加文章

文章在 `content/resources/`，使用 Markdown frontmatter。新文章先设置：

```yaml
status: "draft"
noindex: true
```

技术审核通过后再改为：

```yaml
status: "published"
noindex: false
```

## 11. 如何配置询盘邮件

复制 `.env.example` 为 `.env.local`，配置：

需要配置 `LEAD_PROVIDER`、`LEAD_NOTIFICATION_EMAIL` 和 `RESEND_API_KEY`。真实值只填写在服务器环境变量中，不写入代码或文档。

当前邮件适配器只保留接口结构，未启用真实发送。接入真实邮件前需要完成服务端发送逻辑和测试。

## 12. 如何配置 GA4

在 `.env.local` 中设置：

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

当前项目只预留 analytics 事件，不会在未配置时加载或报错。

## 13. 如何配置域名

在 `.env.local` 和生产环境变量中设置：

```bash
NEXT_PUBLIC_SITE_URL=https://www.your-domain.com
```

该值会用于 canonical、Open Graph、robots 和 sitemap。

## 14. 如何部署到 Vercel

1. 将代码提交到 Git 仓库。
2. 在 Vercel 导入项目。
3. 配置环境变量。
4. 运行生产构建。
5. 部署前执行 `npm run verify`。

本项目不会自动部署。

## 14.1 部署到 Hostinger

目标部署方式：Hostinger Business Web Hosting 的 Node.js Web App，通过 GitHub repository deployment 持续部署。

推荐流程：

1. 将项目推送到 GitHub。
2. 登录 Hostinger hPanel。
3. 进入 Websites。
4. 选择 Add Website 或 Deploy Web App。
5. 选择 Node.js Web App。
6. 连接 GitHub 仓库。
7. 选择 `main` 分支。
8. 确认 Node.js 版本为 22.x。
9. 安装命令使用 `npm ci`。
10. 构建命令使用 `npm run build`。
11. 启动命令使用 `npm run start`。
12. 在 hPanel 添加环境变量。
13. 首次使用临时域名部署。
14. 检查构建日志。
15. 检查运行日志。
16. 测试所有主要页面。
17. 测试 RFQ 表单。
18. 确认无误后连接正式域名。
19. 检查 SSL。
20. 更新 `NEXT_PUBLIC_SITE_URL`。
21. 重新部署。
22. 检查 canonical、sitemap 和 robots。

Hostinger 环境变量表：

| 变量名 | 用途 | 是否必需 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 生成 canonical、sitemap、robots 和 Open Graph URL | 上线正式域名后必需 |
| `NEXT_PUBLIC_GA_ID` | GA4 Measurement ID | 可选 |
| `LEAD_PROVIDER` | 询盘 provider，开发可用 `development`，生产建议配置 `email` | 生产询盘必需 |
| `LEAD_NOTIFICATION_EMAIL` | 询盘通知收件邮箱 | 使用 email provider 时必需 |
| `RESEND_API_KEY` | 邮件服务 API Key | 使用 email provider 时必需 |
| `MAX_UPLOAD_SIZE_MB` | RFQ 上传文件大小限制 | 可选，默认 5 |
| `ALLOWED_UPLOAD_TYPES` | RFQ 允许上传的 MIME 类型 | 可选 |

不要把真实密钥写入代码、README 或 GitHub workflow。

## 15. 项目目录说明

- `app/`：Next.js 页面、路由、API、robots 和 sitemap。
- `src/components/`：可复用组件。
- `src/config/`：品牌配置和页面配置。
- `src/lib/`：产品、内容、SEO、询盘、analytics 等业务逻辑。
- `data/`：产品 CSV 数据。
- `content/resources/`：Markdown 资源文章。
- `knowledge/`：真实业务资料和禁止声明规则。
- `public/images/placeholders/`：明确标记的占位图。
- `scripts/`：检查和报告脚本。
- `tests/`：自动化测试。

## 16. 数据字段说明

`data/products.csv` 包含 SKU、slug、产品名称、分类、结构、直径、材质、涂层、应用、定制、标准、认证、MOQ、交期、图片、datasheet、featured、status、SEO 标题和描述等字段。

未知字段应留空，不得补写未经确认的数据。

## 16.1 环境变量说明

- `NEXT_PUBLIC_SITE_URL`：站点正式 URL；未配置时本地使用 localhost 默认值。
- `NEXT_PUBLIC_GA_ID`：GA4 ID；为空时不加载或发送 GA 事件。
- `LEAD_PROVIDER`：询盘处理方式；开发环境可用 `development`。
- `LEAD_NOTIFICATION_EMAIL`：真实询盘通知邮箱。
- `RESEND_API_KEY`：邮件服务密钥，只能配置在服务端环境变量。
- `MAX_UPLOAD_SIZE_MB`：RFQ 上传文件大小限制。
- `ALLOWED_UPLOAD_TYPES`：RFQ 允许的 MIME 类型列表。

## 17. 常见错误处理

- 产品未显示：确认 `status=published`，并运行产品验证。
- sitemap 没有产品：只有 published 产品进入 sitemap。
- 表单提交失败：开发模式只记录提交；生产邮件模式需要配置服务端邮件。
- SEO 检查失败：检查重复 title、description、slug 或 draft/noindex 状态。
- 品牌迁移检查失败：检查是否残留原站域名、原品牌或原公司身份。
- 联系方式泄露检查失败：检查是否残留原站邮箱、电话、WhatsApp、地图或社媒链接。
- 重复产品检查失败：合并采购意图相同、仅名称或单一规格不同的产品。

## 18. 发布前检查清单

- `npm run verify` 通过。
- 产品参数来自真实资料。
- 授权来源迁移内容已清除原品牌、原联系方式和原站内链。
- 产品通过重复检查，不存在低价值重复页。
- 没有虚假认证、客户、产能、MOQ、交期或破断拉力。
- 图片为真实授权素材或明确占位图。
- 联系方式、域名和邮件配置已确认。
- draft 内容不会进入 sitemap。

## 19. 禁止虚构业务资料的规则

不得虚构 ISO、CE、API 认证、客户数量、出口国家、生产年限、月产能、设备数量、检测报告、客户 Logo、工程案例、交期、MOQ、破断拉力、材质等级、符合标准、测试能力或产品安全等级。

## 20. 下一阶段建议

1. 补充真实公司资料和联系方式。
2. 补充真实产品参数、图片和 datasheet。
3. 确认制造能力、质量控制和认证资料。
4. 接入真实邮件服务并测试询盘通知。
5. 发布第一批 reviewed/published 产品和技术文章。
