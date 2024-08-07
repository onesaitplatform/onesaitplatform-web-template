// IF BALANCER DEFINED, USE IT , OTHERWISE USE STANDARD APP
const BALANCER = process.env.VUE_APP_BALANCER ? process.env.VUE_APP_BALANCER : '/web/' + process.env.VUE_APP_APPLICATION + '/'
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? BALANCER : '/',

  chainWebpack: config => {
    const oneOfsMap = config.module.rule('scss').oneOfs.store
    oneOfsMap.forEach(item => {
      item
        .use('sass-resources-loader')
        .loader('sass-resources-loader')
        .options({
          resources: [
            'node_modules/@ods/ods/packages/theme-onesait/src/tokens/index.scss', // ODS TOKENS
            'node_modules/@ods/ods/packages/theme-onesait/src/utils/index.scss', // ODS MIXINS & HELPERS
            'node_modules/@ods/ods/packages/theme-onesait/src/common/_var.scss' // ODS VARS
          ]
        })
        .end()
    })
  }
}
