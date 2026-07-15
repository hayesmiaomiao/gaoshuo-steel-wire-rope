# AGENTS.md

## Communication

- 与用户使用中文沟通。
- 网站前台内容使用专业英文。
- 技术术语保持准确。
- 完成任务后提供中文报告。

## Business Truth

- 不得虚构产品参数。
- 不得虚构认证。
- 不得虚构工厂能力。
- 不得虚构客户。
- 不得虚构案例。
- 不得虚构标准符合性。
- 不得虚构MOQ、交期和产能。
- 只使用 `data` 和 `knowledge` 中的已确认信息。
- 用户已确认一组来源网站的产品内容与服务内容可用于本项目迁移；具体来源域名只保存在 `research/` 内部审计文件中。
- 迁移内容必须清除原品牌、原域名作为前台文案、原联系方式、原公司身份、原Logo、原地图、原社媒、原表单地址和原版权信息。
- 原站图片只能先记录到 `research/image-migration.csv`，不得默认外链、批量下载或发布。
- 公司级宣传声明仍不得自动迁移，除非用户后续单独确认。
- 迁移后的产品只有通过去重、品牌清理、联系方式清理、SEO改写、数据验证和构建检查后，才可以设置为 `published`。

## Development

- 使用TypeScript。
- 保持组件可复用。
- 优先服务端组件。
- 不修改无关文件。
- 不使用 `any`，除非有明确理由。
- 运行 lint、typecheck 和 build。
- 不得把密钥写入代码。
- 不自动部署。
- 不自动删除用户内容。

## SEO

- 每个页面只服务一个主要搜索意图。
- 不创建薄内容页面。
- 不创建关键词堆砌内容。
- 不生成城市门页。
- 不生成重复产品页。
- 不索引 draft 内容。
- 不使用虚假 Schema 数据。
- 迁移内容必须重写 URL、Title、Description、H1、CTA、FAQ、内链锚文本、图片 alt、Open Graph、Schema 描述和 Breadcrumb。
- 不保留原站 title 模板、meta 模板、canonical、Schema 公司信息或原站内链。

## Migration Checks

- 运行 `npm run check:brand-migration` 检查原品牌和原域名残留。
- 运行 `npm run check:contact-leaks` 检查原联系方式泄露。
- 运行 `npm run check:duplicate-products` 检查重复或高度相似产品。
- `npm run verify` 必须包含以上检查。

## Reporting

每次完成任务后报告：

- 修改文件
- 新增功能
- 测试结果
- 未完成事项
- 需要用户补充的真实资料
- 潜在风险
