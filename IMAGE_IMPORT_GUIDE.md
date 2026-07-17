# 产品原图导入指南

本目录体系用于集中接收产品原图。原图不会直接公开到网站，也不会在此阶段执行图片转换或发布。

## 原图放置目录

请根据产品分类和产品 slug，将原图放入对应目录：

```text
image-import/{category}/{product-slug}/
```

每个目录中的 `README.txt` 都列出了产品名称、SKU、slug、分类和推荐文件名。请先核对这些信息，再放入对应产品的原图。

如果不确定图片属于哪个产品，请放入：

```text
image-import/unmatched/
```

不要自行新建或修改产品 slug 目录名。

## 推荐命名

- 主图：`main-original-01.jpg`
- 产品细节：`detail-original-01.jpg`、`detail-original-02.jpg`
- 端头细节：`terminal-original-01.jpg`
- 应用图：`application-original-01.jpg`
- 包装图：`packaging-original-01.jpg`

后续如需增加同类图片，请保持用途前缀不变并按顺序编号。

## 禁止使用的图片

- 带第三方品牌或 Logo 的图片
- 带电子邮箱地址的图片
- 带电话号码的图片
- 带 WhatsApp 号码的图片
- 带网站水印或原站域名的图片
- 与当前产品无关的图片
- 来源或使用权不明确的图片

## 管理规则

- 不要修改产品 slug 目录名，否则后续自动匹配会失败。
- 原图只作为内部处理源文件，不会直接从 `image-import/` 公开到网站。
- 原图后续会统一检查、裁切并转换为 WebP，再按审核结果进入公开图片目录。
- 不要把同一张产品图放入多个产品目录，避免产品归属混乱和重复发布。
- 不确定对应产品时，将图片放入 `image-import/unmatched/`，等待人工确认。
- 此阶段不要自行移动到 `public/images/products/`，也不要执行图片转换。

