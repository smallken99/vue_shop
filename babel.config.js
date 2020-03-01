// 项目发布阶段需要用到的 babel 插件
const prodPlugins = []
if(process.env.NODE_ENV === 'production'){
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  'presets': [
    '@vue/cli-plugin-babel/preset'
  ],
  'plugins': [
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    // 发布产品时的插件数据 
    // ...表示展开运算符 把数组中的每一项展开放在另一个数组中
    ...prodPlugins,
    // 实现路由懒加载
    '@babel/plugin-syntax-dynamic-import'
  ]
}
