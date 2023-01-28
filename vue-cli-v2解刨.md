目前前端发展非常的迅速，相信同学们肯定都用过`vue`框架，平时我们在工作中为了方便可以通过`vue-cli`快速构建我们的项目，提高了我们的开发效率。如果我们自己实现一个脚手架会不会难住一部分同学呢？假期还没结束，闲着也是闲着，找了个`vue-cli`比较简单的版本来解刨一下，相信看完之后你也可以搭建一个自己的脚手架。
## 源码地址
我们直接从github打开地址clone下来即可
```js
git clone git@github.com:vuejs/vue-cli.git
```
然后将分支切换到v2就是我们今天要看到代码分支。
## init初始化
```js
vue init webpack [project-name]
```
当我们使用`vue-cli`的时候，使用上面的命令。然后这行命令执行，其实就是执行我们源码中`bin/vue-init`文件。下面我们就来看看这个文件
```js
/**
 * Usage.
 */
// 配置command使用方法
program
  .usage('<template-name> [project-name]')
  .option('-c, --clone', 'use git clone')
  .option('--offline', 'use cached template')

/**
 * Help.
 */

program.on('--help', () => {
  console.log('  Examples:')
  console.log()
  console.log(chalk.gray('    # create a new project with an official template'))
  console.log('    $ vue init webpack my-project')
  console.log()
  console.log(chalk.gray('    # create a new project straight from a github template'))
  console.log('    $ vue init username/repo my-project')
  console.log()
})

/**
 * Help.
 */

function help () {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}
help()
```
这里主要是对`commander`进行配置，当我们执行`vue init`后面不传参的时候或者执行`vue init --help`会在命令行给出一些提示信息
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff2e2d45ecbc47939614218478efbbcb~tplv-k3u1fbpfcp-watermark.image?)
### settings
```js
let template = program.args[0]
const hasSlash = template.indexOf('/') > -1
const rawName = program.args[1]
const inPlace = !rawName || rawName === '.' // 判断项目名是否为空 或者为'.'
const name = inPlace ? path.relative('../', process.cwd()) : rawName
const to = path.resolve(rawName || '.')
const clone = program.clone || false

// 模板地址的加载
const tmp = path.join(home, '.vue-templates', template.replace(/[\/:]/g, '-'))
console.log(tmp);
// vue init --offline xx xx 会读取缓存中的模板
if (program.offline) {
  console.log(`> Use cached template at ${chalk.yellow(tildify(tmp))}`)
  template = tmp
}
```
这里主要是定义了一些变量。首先通过`program.args`获取命令行的参数，第一个参数是模板`template`，第二个参数是项目名称`rawName`。`template`主要有两种，一种是通过官方的webpack创建，另一种是通过github上面的第三方仓库当做模板创建，`hasSlash`则表示如果`template`上有`/`则表示是使用第二种方式创建模板。`inPlace`判断项目名称是否为空或者是否为'.'。`name`表示项目名，`to`表示当前项目的目录。`clone`则在下面下载的时候判断是从第三个`clone`还是`download`。

我们首先会根据`template`去下载模板，下载完成之后会存放在根目录下的`.vue-templates`文件中，而`tmp`就是我们当前模板的地址。如果参数中有`--offline`则表示直接取本地已经下载好的模板，就不需要去重新下载模板了。
### 执行run
```js
// 是否为在当前目录下创建 or 存在当前目录
if (inPlace || exists(to)) {
  inquirer.prompt([{
    type: 'confirm',
    message: inPlace
      ? 'Generate project in current directory?'
      : 'Target directory exists. Continue?',
    name: 'ok'
  }]).then(answers => {
    if (answers.ok) {
      run()
    }
  }).catch(logger.fatal)
} else {
  run()
}
```
对`inPlace`和`exists(to)`判断是否当前目录下已经创建或者是否已经存在当前目录。如果是则进行询问是否继续创建，否则执行`run`,如果继续创建也执行`run`
```js
/**
 * Check, download and generate the project.
 */
function run () {
  // check if template is local
  // 如果走的是本地的模板
  if (isLocalPath(template)) {
    const templatePath = getTemplatePath(template)
    // 如果本地模板存在
    if (exists(templatePath)) {
      generate(name, templatePath, to, err => {
        if (err) logger.fatal(err)
        console.log()
        logger.success('Generated "%s".', name)
      })
    } else {
      logger.fatal('Local template "%s" not found.', template)
    }
  } else {
    // 走官方模板
    checkVersion(() => {
      if (!hasSlash) {
        // use official templates
        const officialTemplate = 'vuejs-templates/' + template
        if (template.indexOf('#') !== -1) {
          downloadAndGenerate(officialTemplate)
        } else {
          if (template.indexOf('-2.0') !== -1) {
            warnings.v2SuffixTemplatesDeprecated(template, inPlace ? '' : name)
            return
          }

          // warnings.v2BranchIsNowDefault(template, inPlace ? '' : name)
          downloadAndGenerate(officialTemplate)
        }
      } else {
        downloadAndGenerate(template)
      }
    })
  }
}
```
如果是本地的模板则拿到`template`的地址进行判断，如果地址存在则执行`generate`（这个方法下面单独说）。否则则取得是官方模板，然后对版本号进行审核。
```js
module.exports = done => {
  // Ensure minimum supported node version is used
  if (!semver.satisfies(process.version, packageConfig.engines.node)) {
    return console.log(chalk.red(
      '  You must upgrade node to >=' + packageConfig.engines.node + '.x to use vue-cli'
    ))
  }

  request({
    url: 'https://registry.npmjs.org/vue-cli',
    timeout: 1000
  }, (err, res, body) => {
    if (!err && res.statusCode === 200) {
      const latestVersion = JSON.parse(body)['dist-tags'].latest
      const localVersion = packageConfig.version
      if (semver.lt(localVersion, latestVersion)) {
        console.log(chalk.yellow('  A newer version of vue-cli is available.'))
        console.log()
        console.log('  latest:    ' + chalk.green(latestVersion))
        console.log('  installed: ' + chalk.red(localVersion))
        console.log()
      }
    }
    done()
  })
}
```
首先会判断当前node版本号是否大于规定的版本号，如果小于在提示更新node版本。然后请求`https://registry.npmjs.org/vue-cli`拿到当前`vue-cli`最新的版本和本地的版本进行对比，如果本地的版本小于最新的版本，则提示版本信息。

版本号审核完毕之后，判断是从github上下载模板还是从官方下载模板。最终都会执行`downloadAndGenerate`
```js

function downloadAndGenerate (template) {
  const spinner = ora('downloading template')
  spinner.start()
  // Remove if local template exists
  if (exists(tmp)) rm(tmp)
  download(template, tmp, { clone }, err => {
    spinner.stop()
    if (err) logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())
    generate(name, tmp, to, err => {
      if (err) logger.fatal(err)
      console.log()
      logger.success('Generated "%s".', name)
    })
  })
}
```
`spinner.start()`是下载时候的loading,如果当前模板已经存在，则先删除掉，在执行`download`。
### download
```js
function download (repo, dest, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = null
  }
  opts = opts || {}
  var clone = opts.clone || false

  repo = normalize(repo)
  var url = getUrl(repo, clone)

  if (clone) {
    gitclone(url, dest, { checkout: repo.checkout, shallow: repo.checkout === 'master' }, function (err) {
      if (err === undefined) {
        rm(dest + '/.git')
        fn()
      } else {
        fn(err)
      }
    })
  } else {
    downloadUrl(url, dest, { extract: true, strip: 1, mode: '666', headers: { accept: 'application/zip' } }).then(data => {
      fn()
    }).catch(err => {
      fn(err)
    })
  }
}
```
如果需要`clone`则执行`gitclone`去`clone`模板，否则执行`downloadUrl`去下载模板。这两个方法是使用的第三方的库，有兴趣可以了解一下。

下载完成之后，`spinner.stop()`关闭loading,然后开始`generate`生成了。

## generate