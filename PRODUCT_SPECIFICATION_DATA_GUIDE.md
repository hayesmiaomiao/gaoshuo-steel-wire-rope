# 产品技术参数填写指南

本指南用于维护 `data/product-specifications-zh.csv`。中文文件是人工填写入口，英文文件 `data/product-specifications.csv` 由同步脚本生成并供网站读取。

## 一、基本规则

1. 每个 SKU 只占一行，不能重复。
2. `SKU`、`产品Slug`、`产品名称`必须与 `data/products.csv` 完全一致。
3. 明确不适用的字段填写 `N/A`。
4. 尚未确认或没有正式依据的字段填写 `TBD`。
5. 除未审核状态下的“审核人”和“审核日期”外，不要留下空字符串。
6. 数值字段只填写数字，不填写 `mm`、`N`、`kN` 等单位。
7. 直径和长度单位由字段名中的 `mm` 管理；载荷单位由“载荷单位”字段管理。
8. 固定尺寸必须在最小值和最大值中重复填写同一个数字。
9. 范围尺寸必须同时填写最小值和最大值，不能只填写一端。
10. 钢丝绳结构统一使用小写字母 `x`，例如 `7x7`，不要使用乘号 `×`。
11. 可定制项目使用英文分号 `;` 分隔。
12. 审核日期统一使用 `YYYY-MM-DD`。

## 二、禁止推测的内容

- 不要根据产品名称推测材质或材质牌号。
- 不要把 Stainless Steel 自动写成 AISI 304、AISI 316 或 AISI 316L。
- 不要根据直径或行业常见值推测破断拉力、工作载荷或安全系数。
- 不要把最小破断拉力写成工作载荷。
- 不要填入没有图纸、规格书、测试报告或正式供应商数据支持的标准。
- 不要复制未经 Gaoshuo 确认的 MOQ、样品交期或批量交期。
- 不要根据产品图片观察结果填写端头尺寸、螺纹或载荷。

## 三、状态规则

| 验证状态 | 使用条件 |
| --- | --- |
| `unverified` | 技术字段全部为 `TBD` 或 `N/A`，尚未人工核对 |
| `incomplete` | 已填写部分真实参数，但关键字段仍不完整 |
| `reviewed` | 已人工核对，但尚未得到最终批准 |
| `approved` | 已由用户或指定审核人最终确认 |
| `rejected` | 参数来源错误、记录无效或不能继续使用 |

`approved` 状态不能包含 `TBD`，并且必须填写审核人和审核日期。同步命令不会自动把任何产品改成 `approved`。

## 四、数值与单位

- 钢丝绳直径、包胶后直径、长度、行程和适配直径：只填写数字，单位固定为毫米。
- 最小破断拉力和工作载荷：只填写数字。
- 载荷单位只允许：`N`、`kN`、`kgf`、`lbf`、`N/A`、`TBD`。
- 有数字载荷时必须填写真实单位。
- 当破断拉力和工作载荷使用同一个单位时，工作载荷不能大于破断拉力。

## 五、图纸与数据表

1. 图纸先放入 `public/documents/drawings/`。
2. 数据表先放入 `public/documents/datasheets/`。
3. CSV 中只填写公开相对路径，例如 `/documents/drawings/GS-WRA-001-drawing.pdf`。
4. 文件未提供时填写 `TBD`，明确不适用时填写 `N/A`。
5. 不要填写 Windows 绝对路径、反斜杠路径、外部 URL 或不存在的文件路径。

## 六、分类专用字段

- Tool & Safety Lanyards：收缩长度、伸展长度。
- Suspension & Hanging Kits：上端配件、下端配件、夹持器类型。
- Control & Brake Cables：内芯钢丝、外护套、行程。
- Wire Rope Fittings：适配钢丝绳最小和最大直径。

不属于该分类的专用字段保持 `N/A`。不要为了提高完整度强行填写不相关字段。

## 七、演示数据示例

以下内容仅用于说明填写格式，全部是虚构的演示数据，不是 Gaoshuo 的真实产品参数，不得复制到正式 SKU 或发布到网站。

### 示例 A：完整的 Wire Rope Assembly（演示数据）

| 字段 | 演示值 |
| --- | --- |
| SKU | DEMO-WRA-001 |
| 产品Slug | demo-wire-rope-assembly |
| 产品名称 | Demo Wire Rope Assembly |
| 钢丝绳结构 | 7x7 |
| 材质 | Stainless Steel |
| 材质牌号 | AISI 304 |
| 钢丝绳最小直径mm | 2 |
| 钢丝绳最大直径mm | 4 |
| 包胶材质 | PVC |
| 包胶颜色 | Black |
| 包胶后最小直径mm | 3 |
| 包胶后最大直径mm | 5 |
| 最小长度mm | 300 |
| 最大长度mm | 2000 |
| 长度公差 | ±2 mm |
| 芯材 | Steel Core |
| 捻向 | Right Regular Lay |
| 表面处理 | PVC Coated |
| A端类型 | Eye Loop |
| A端螺纹 | N/A |
| A端主要尺寸 | Eye ID 12 mm; sleeve length 18 mm |
| B端类型 | Threaded Terminal |
| B端螺纹 | M6 |
| B端主要尺寸 | According to drawing |
| 最小破断拉力 | 5000 |
| 工作载荷 | 1000 |
| 载荷单位 | N |
| 适用标准 | According to customer drawing |
| MOQ | 100 pcs |
| 样品交期 | 7–10 working days |
| 批量交期 | 20–30 working days |
| 包装方式 | Individual PE bag + export carton |
| 可定制项目 | Diameter;Length;Coating color;End fittings;Packaging |
| 图纸文件 | /documents/drawings/DEMO-WRA-001-drawing.pdf |
| 数据表文件 | /documents/datasheets/DEMO-WRA-001-datasheet.pdf |
| 验证状态 | approved |
| 审核人 | Demo Reviewer |
| 审核日期 | 2026-01-01 |
| 备注 | DEMO DATA ONLY — DO NOT PUBLISH |

其余分类专用字段均为 `N/A`。演示路径没有对应正式文件，因此不能复制到实际 CSV。

### 示例 B：Wire Rope Fitting 的 N/A 用法（演示数据）

| 字段 | 演示值 |
| --- | --- |
| SKU | DEMO-FIT-001 |
| 产品名称 | Demo Wire Rope Thimble |
| 钢丝绳结构 | N/A |
| 钢丝绳最小直径mm | N/A |
| 钢丝绳最大直径mm | N/A |
| 包胶材质 | N/A |
| 包胶颜色 | N/A |
| 包胶后最小直径mm | N/A |
| 包胶后最大直径mm | N/A |
| 最小长度mm | N/A |
| 最大长度mm | N/A |
| 芯材 | N/A |
| 捻向 | N/A |
| 材质 | TBD |
| 表面处理 | TBD |
| A端主要尺寸 | TBD |
| 适配钢丝绳最小直径mm | TBD |
| 适配钢丝绳最大直径mm | TBD |
| 验证状态 | unverified |
| 备注 | DEMO DATA ONLY — DO NOT PUBLISH |

配件不包含钢丝绳结构，因此相关字段可以填写 `N/A`；材质、尺寸和适用标准仍需保持 `TBD`，直到获得真实资料。

### 示例 C：大部分参数未确认（演示数据）

| 字段 | 演示值 |
| --- | --- |
| SKU | DEMO-UNVERIFIED-001 |
| 产品Slug | demo-unverified-product |
| 产品名称 | Demo Unverified Product |
| 所有适用技术字段 | TBD |
| 明确不适用字段 | N/A |
| 验证状态 | unverified |
| 审核人 | 留空 |
| 审核日期 | 留空 |
| 备注 | DEMO DATA ONLY — DO NOT PUBLISH |

## 八、填写后的执行顺序

```text
npm run specs:sync
npm run specs:validate
npm run specs:report
npm run verify
```

完成命令后，再人工打开对应产品详情页检查显示结果。只有用户明确授权覆盖已批准数据时，才可以运行 `npm run specs:sync:force`。
