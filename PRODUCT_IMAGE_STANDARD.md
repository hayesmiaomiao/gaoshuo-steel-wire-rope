# 正式产品图片规范

本规范用于管理授权原图与网站生产图片。当前产品没有真实图片时继续使用现有占位图，不得伪造或补写不存在的图片路径。

## 目录规范

原始授权图片：

```text
image-import/{category}/{product_slug}/
```

生产图片：

```text
public/images/products/{product_slug}/
```

产品目录名必须与 `data/products.csv` 中的产品 slug 完全一致。不得使用 SKU、中文、空格、大写字母、Windows 绝对路径、来源网站名称或原品牌名称作为目录名。

## 主图规范

文件名：`main.webp`

- 建议尺寸：1200 × 1200 px
- 比例：1:1
- 格式：WebP
- 建议文件大小：80 KB 至 250 KB
- 最大文件大小：500 KB
- 背景：白色或浅灰色

要求：

- 产品主体完整
- 端头不能被裁掉
- 不得拉伸
- 不得出现其他品牌 Logo
- 不得出现邮箱
- 不得出现电话号码
- 不得出现 WhatsApp
- 不得出现网站水印
- 不得出现与产品无关的文字

## 细节图规范

文件名：

- `detail-01.webp`
- `detail-02.webp`
- `detail-03.webp`
- `detail-04.webp`

- 建议尺寸：1200 × 900 px
- 比例：4:3
- 格式：WebP
- 建议文件大小：100 KB 至 350 KB

## 端头图规范

文件名：

- `terminal-01.webp`
- `terminal-02.webp`

建议内容：

- Hook
- Eye Loop
- Swaged Sleeve
- Threaded Terminal
- Ball End
- Cable Gripper
- Thimble
- Stop Sleeve

## 应用图规范

文件名：

- `application-01.webp`
- `application-02.webp`

要求：

- 应用场景必须与对应产品相关
- 不得使用无法证明的客户项目图片
- 不得使用带第三方品牌的设备图片
- 不得使用与产品不符的应用图

## 其他允许文件名

- `construction-01.webp`：钢丝绳或组件结构展示
- `packaging-01.webp`：包装展示
- `drawing-01.webp`：结构图或尺寸图

除本规范列出的文件名外，不得在正式产品目录中放置其他文件。

## Alt 文本规范

主图 alt 必须描述：产品名称 + 可见材质、涂层或端头特征。

示例：

```text
Stainless steel wire rope assembly with swaged eye terminal
```

禁止使用：

- `product image`
- `image`
- `best wire rope`
- `cheap steel cable`
- `leading manufacturer`
- `wire rope wire rope wire rope`

## 正式路径规范

主图未来必须写为：

```text
/images/products/{product_slug}/main.webp
```

图库图片必须使用相同产品目录下的标准文件名。不得在产品图片字段中写入 Windows 绝对路径、`image-import/` 路径、外部网站或 CDN 地址，以及不存在的文件路径。

## 禁止事项

- 禁止使用原网站 Logo
- 禁止使用原网站联系方式
- 禁止直接外链原网站图片
- 禁止使用 Google 图片搜索结果
- 禁止把一张图片用于所有产品
- 禁止把分类图片伪装成具体产品图
- 禁止把 AI 图片伪装成真实产品照片
- 禁止将 `image-import` 目录公开到网站
- 禁止提交大体积原始图片到 GitHub

