# Hostinger Deployment Checklist

## 部署前

- [ ] 本地 `npm ci` 成功
- [ ] `npm run verify` 通过
- [ ] Git 工作区干净
- [ ] `main` 分支正确
- [ ] `package-lock.json` 已提交
- [ ] Node.js 版本固定为 22.x
- [ ] 环境变量清单完成
- [ ] 原品牌清理完成
- [ ] 原联系方式清理完成
- [ ] 询盘接收方式已确认
- [ ] 正式域名已确认
- [ ] 产品图片已检查
- [ ] SEO 检查通过

## Hostinger 首次部署

- [ ] 选择 Node.js Web App
- [ ] 连接正确 GitHub 仓库
- [ ] 选择正确分支
- [ ] 选择 Node.js 22
- [ ] 安装命令为 `npm ci`
- [ ] 构建命令为 `npm run build`
- [ ] 启动命令为 `npm run start`
- [ ] 环境变量正确
- [ ] 构建成功
- [ ] 应用成功启动
- [ ] 临时域名可以访问

## 临时域名验收

- [ ] 首页正常
- [ ] 导航正常
- [ ] 产品页正常
- [ ] 服务页正常
- [ ] 应用页正常
- [ ] 图片正常
- [ ] 移动端正常
- [ ] RFQ 正常
- [ ] 404 正常
- [ ] robots 正确
- [ ] sitemap 正确
- [ ] 无原品牌残留
- [ ] 无原联系方式残留
- [ ] 浏览器控制台无明显错误

## 正式域名上线

- [ ] 连接正式域名
- [ ] SSL 正常
- [ ] 更新 `NEXT_PUBLIC_SITE_URL`
- [ ] canonical 更新
- [ ] sitemap 更新
- [ ] robots 更新
- [ ] www 与非 www 版本统一
- [ ] HTTP 跳转 HTTPS
- [ ] 重新提交 Google Search Console
- [ ] 配置 GA4
- [ ] 配置询盘通知
- [ ] 完成真实询盘测试
