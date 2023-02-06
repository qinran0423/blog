在我们看`_init`的时候，会看到`mergeOptions`这个方法，很多同学都这个这个方法的作用是“合并属性”，然后就直接跳过了，因为我之前就是这样的，哈哈哈~~~ 今天我们就来看看`mergeOptions`都是怎么merge的。
## 为什么要merge?
我们首先看个简单的例子
```js
var mixin = {
    data() {
      return {
        message: 'hello',
        foo:'abc'
      }
    }
}

new Vue({
    mixins:[mixin],
    data() {
      return {
        message:'goodbye',
        bar: 'def'
      }
    },
    created() {
      console.log(this.$data);
      // {message: 'goodbye', foo:'abc', bar:'def'}
    },
})
```
比如我们在使用mixin的时候，如果mixin中的数据和我们实例中的数据发生了冲突，我们需要用哪一个呢？就会出现问题。所以需要对属性merge（当然mixin只是一个特殊的例子）。
## 解读mergeOptions
在`new Vue()`的时候，会执行Vue原型上面的`_init`方法，然后会立即执行`mergeOptions`方法
```js
Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    ···
    vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
   ···
  }
```
mergeOptions方法有三个属性，第一个是`resolveConstructorOptions(vm.constructor)`,第二个是我们传给`new Vue()`传入的参数，第三个参数是实例自己。此时我们就会对resolveConstructorOptions这个方法产生疑问。
### resolveConstructorOptions
```js
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}
```
resolveConstructorOptions方法传入的是实例的构造函数，其实就是返回构造函数的options。`Ctor.options`就是Vue构造函数的`options`，`Ctor.super`这个值是在extend调用的时候添加的，判断`Ctor.super`如果存在，说明Ctor是通过继承而来的子构造函数，如果在extend后，我们又在父构造函数的options上添加新的属性，这个时候子构造函数是无法继承新的属性的。所以需要通过`Ctor.super`向上找，找出所有父构造函数更新的options属性，并更新到子构造函数上，这就能解决`Vue.options`被更改的问题了。

### mergeOptions的实现
下面我们看下mergeOptions是怎么实现的
```js
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    // 校验选项中的components里的名称是否合法
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```
#### 选项校验和规范化
首先通过checkComponents对components的组件名称进行校验。
```js
function checkComponents (options: Object) {
  for (const key in options.components) {
    validateComponentName(key)
  }
}

export function validateComponentName (name: string) {
  if (!new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    )
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    )
  }
}
```
checkComponents对options的中的所有组件遍历校验，如果不符合规则则发出警告。
然后分别对props，inject,和directives进行标准化。
- `normalizeProps`：处理props，将数组形式定义的props转换成对象形式
- `normalizeInject`：处理inject，将数组形式定义的inject转换成对象形式
- `normalizeDirectives`：处理directives，将数组形式定义的directives转换成对象形式

然后就是真正的合并。遍历父和子的属性值（data、methods、created等），然后调用`mergeField`。`mergeField`是通过key在strats中找到对应的合并策略，然后用该合并策略进行相应合并，如果找不到就使用默认的合并策略。
#### data合并
```js
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
}
```
当vm不存在的时候，如果`childVal`也就是`data`不是函数的时候，那么在非开发环境会报错，这也是我们为什么在写组件data的时候需要写成函数的原因。我们从源码中搜一下看看哪里使用的`mergeOptions`


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/649cbf532efd4e41988538cef8bddb01~tplv-k3u1fbpfcp-watermark.image?)
点开之后你会发现，在extend和mixin中是没有传入vm的，因为extend和mixin处于构造函数阶段，是没有vm的。我们这里主要看下extend.

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52a0059f7cf34a84aa9672fa7b5fa0e6~tplv-k3u1fbpfcp-watermark.image?)

extend主要在两个地方被调用。第一个是在`src/core/global-api/assets.js`中的`initAssetRegisters`。
```js
export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
// src/shared/constants.js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```
遍历了`ASSET_TYPES`，然后再Vue构造函数上添加这些属性。我们这里主要看component,当我们使用`Vue.component`时候，就会执行`this.options._base.extend(definition)`,调用了extend方法将传入的组件选项合并后返回新的构造函数。

第二个位置在`src/core/vdom/create-component.js`
```js
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  ···
  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }
  ···

  return vnode
}
```
传入Ctor一种情况是全局定义的组件，此时Ctor通过entend创建，传入的是构造函数形式。另一种情况则是局部注册组件，传入的是选项配置形式，会执行`baseCtor.extend(Ctor)`,同样会通过extend创建构造函数。

无论是全局注册的组件还是局部组件，最终都会调用extend方法，而extend方法在合并选项的时候会校验传入的data是否是函数形式。

我们回到合并data,调用了`mergeDataOrFn`,在`mergeDataOrFn`中调用了`mergeData`。
```js
function mergeData (to: Object, from: ?Object): Object {
  if (!from) return to
  let key, toVal, fromVal

  const keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from)

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    // in case the object is already observed...
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}
```
其实就是将from的值合并到to中，然后返回to。如果from不存在则直接返回to。遍历from的每一个key,如果to找那个本身不存在key，那么将直接赋值。如果两个都是对象，则递归合并。
#### 生命周期合并
首先看下生命周期都定义了哪些钩子。
```js
// src/shared/constants.js
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
]
```
`mergeHook`是生命周期钩子合并的策略
```js
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  const res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
  return res
    ? dedupeHooks(res)
    : res
}

function dedupeHooks (hooks) {
  const res = []
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i])
    }
  }
  return res
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})
```
其实就是将父选项和子选项的对应生命周期合并成数组形式，如果存在相同的生命周期执行函数，那么会进行去重处理。
看个例子
```js
  const extend = {
    created() {
      console.log("extends");
    },
  };

  const mixins = {
    created() {
      console.log("mixins");
    },
  };

  const Parent = Vue.extend({
    created() {
      console.log("parent created");
    },
    mixins: [mixins],
    extends: extend,
  });

  const Child = Parent.extend({
    created() {
      console.log("child");
    },
    mixins: [mixins],
    extends: {
      created() {
        console.log("child  extends");
      },
    },
  });

  new Child();

  // extends
  // mixins
  // parent created
  // child extends
  // child
  ```
  可能会疑问为什么只会打印一遍'mixins',因为mixins的created在合并的时候去重了，所以只会打印一遍。而在生命周期执行的时候，parent和extends/mixins里面的生命周期都是优于child生命周期执行的。
  
  #### components/filters/directives合并
  ```js
  function mergeAssets (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```
`Object.create()`创建一个新对象，使用现有的对象来提供创建的对象的`__proto__`。这合并资源选项的时候，首先会创建一个原型指向父选项的空对象，再将子选项赋值给空对象。注意，这里的父选项是通过原型链访问的，而子选项是直接添加在对象上的。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/18bd819ddeea4cb3a4070cd2e95e3db8~tplv-k3u1fbpfcp-watermark.image?)
#### watch合并
我们先看代码
```js
strats.watch = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}
```
watch的合并策略：
- 当子选项不存在时，使用父选项
- 当父选项不存在时，使用子选项
- 当父选项和子选项都存在时，如果他们具有相同的watch字段，那么合并成数组。

#### props,methods,inject,computed合并
```js
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (childVal && process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = Object.create(null)
  extend(ret, parentVal)
  if (childVal) extend(ret, childVal)
  return ret
}
```
合并策略：
- 当父选项不存在时，使用子选项
- 当子选项不存在时，使用父选项
- 当父选项和子选项都存在时，使用子选项覆盖父选项

## 总结
- data、provide、props、methods、inject、computed、components、filters、directives基本上都是父子选项同时存在时候，子覆盖父
- 生命周期在父子选择都存在的时候，合并成数组，且去重
- watch在父子选项都存在时候，合并成数组，不去重。


[掘金](https://juejin.cn/post/7192129666441248825/)