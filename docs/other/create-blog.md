
最近写文章越来越多，基本上写完都是发到掘金上的，又希望别人通过github也能够阅读，然后又copy一份放到github上，无意间发现很多同学都在github上搭建了自己的博客（xxxx.github.io)，这样阅读起来的体验感就会提升了很多，所以我也想搭建自己的博客。看到`vitepress`的官网上面有免费的教程，便立刻动起手来。

## 创建项目
```js
// 1. 创建文件夹并进入
mkdir vitepress-starter && cd vitepress-starter
// 2. 初始化pnpm
pnpm init
// 3. 安装vitepress 和 vue
pnpm add -D vitepress vue
// 4. 创建docs文件夹  并新建index.md 写上内容
mkdir docs && echo '# Hello VitePress' > docs/index.md
```
然后我们在`package.json`中配置脚本
```js
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  ...
}

```
这样就可以通过`pnpm docs:dev`运行起来了。此时你会发现`docs`文件夹下面多了个文件夹

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e8e79c55bd7433ab7059958064b880e~tplv-k3u1fbpfcp-watermark.image?)

如果想配置自己的博客，则需要在`docs/.vitepress`新建一个`config.js`，然后通过官网上面的描述去配置就可以了。

如果我们打包的话，打包的文件会放在`docs/.vitepress/dist`下面
## 部署
那如何部署呢？
### .github/workflows/deploy.yml
在我们项目中新建`.github/workflows/deploy.yml`文件，然后根据官网的描述配置。
```js
name: Deploy
on:
  workflow_dispatch: {}
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write     
      id-token: write 
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: yarn
      - run: yarn install --frozen-lockfile
      - name: Build
        run: yarn docs:build
      - uses: actions/configure-pages@v2
      - uses: actions/upload-pages-artifact@v1
        with:
          path: docs/.vitepress/dist
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v1
```
### 初始化git
```js
git init
```
然后在github上创建项目

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ff061298ef14052b777aed2eef66a48~tplv-k3u1fbpfcp-watermark.image?)
将代码提交到github上。这样每次提交完代码之后就会自动部署了。

但是我在自动部署的时候就出现了问题。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c8c903cebc814d38ad8567925b98f7cb~tplv-k3u1fbpfcp-watermark.image?)

奇怪，我是按照官网上面说的配置的啊，为什么会又这种情况？此时你应该好好的看看报错信息，这是说：无法找到可执行的文件pnpm。为什么找不到呢？搜索了好久没有找到答案？或许我们应该安装一下？

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33d1f3ff6feb40639124f6a87f2eaca5~tplv-k3u1fbpfcp-watermark.image?)

此时这个报错就解决了。当你很兴奋的觉得这时候应该没啥问题了吧，然后打开https://xxx.github.io/vitepress-starter, 发现和我们想象的效果不一样，你会发现好像打开是`docs/index.md`这个文件。这又是啥问题呢？

这得需要我们在`github Pages`中配置。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ce6954c1781454ab5cb77cf8e9d1ad5~tplv-k3u1fbpfcp-watermark.image?)

当你看分支的时候，发现多了一个分支`gh-pages`,这个分支里面的东西就是我们打包过后的东西，然后我们根据上图配置即可。

哈哈哈！！！这下总应该可以了吧。

赶紧刷新下页面，发现，我擦咧😂 好像css样式都没有生效哎。

其实官网早就给了提示了。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b6c47fa0f9394a889b954c6bcd7f83f0~tplv-k3u1fbpfcp-watermark.image?)

所以我们需要在config.js中配置base

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c6364351c3a3440284666c8db3768525~tplv-k3u1fbpfcp-watermark.image?)

然后重新提交代码刷新页面~ 终于生效了哦，芜湖~

**所以看似简单的东西一定要动手尝试，说不定就会有你想想不到的问题。**

顺便给大家展示一下我的成果：https://qinran0423.github.io/blog/
