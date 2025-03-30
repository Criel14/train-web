const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 不显示覆盖整个页面的错误提示
  devServer: {
    client: {
      overlay: false
    }
  }
})
