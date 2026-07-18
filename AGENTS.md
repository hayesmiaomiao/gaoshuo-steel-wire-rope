# AGENTS.md

## Communication

- 与用户使用中文沟通，网站前台内容使用专业英文。
- 完成任务后提供中文报告。

## Business truth

- 不得虚构参数、认证、工厂能力、客户、案例、标准符合性、MOQ、交期或产能。
- 只使用 `data/*.json` 中已确认的信息。
- 公司联系渠道为空时不得编造或发布。
- 不得重新引入旧来源品牌、域名、联系方式、Logo、地图、社媒或版权信息。

## Architecture

- 使用 Next.js App Router、TypeScript strict mode、Node.js 22.x。
- 默认使用 React Server Components。
- 客户端边界限于移动导航、产品图库、RFQ UI，以及 Next.js 必需的错误边界。
- 业务数据仅由 `lib/data/*` 在服务器端读取并通过 Zod 校验。
- 使用 CSS Modules 与 `app/globals.css`，不得引入 Tailwind、CSS-in-JS、PWA或Service Worker。
- 不得在客户端直接读取 JSON、CSV、文件系统或网络抓取数据。

## Validation

- 提交前运行 `npm run verify`。
- Hostinger 使用 Node.js 22、`npm ci`、`npm run build`、`npm run start`。
- 临时域名保持 `STAGING_NOINDEX=true`。
