module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/web/' + process.env.VUE_APP_APPLICATION + '/' : '/',
  chainWebpack: config => {
    const oneOfsMap = config.module.rule('scss').oneOfs.store
    oneOfsMap.forEach(item => {
      item
        .use('sass-resources-loader')
        .loader('sass-resources-loader')
        .options({
          resources: [
            'node_modules/@ods/ods/packages/theme-onesait/src/tokens/index.scss', // ODS  TOKENS
            'node_modules/@ods/ods/packages/theme-onesait/src/utils/index.scss', // ODS  MIXINS & HELPERS
            'node_modules/@ods/ods/packages/theme-onesait/src/common/_var.scss' // ODS  VARS
          ]
        })
        .end()
    })
  }
}
