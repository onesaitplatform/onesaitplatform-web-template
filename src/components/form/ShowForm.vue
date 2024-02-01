<template>
  <div id="builder" v-show="!loading" style="height: 100%!important;width:100%!important;">
    <div :id="divIdentifier"></div>
  </div>
</template>
<script>
import {
  getForm,
  getData,
  createData,
  updateData,
  resolveDataSource
} from '@/services/form/api-opServices'
export default {
  name: 'ShowForm',
  props: {
    formcode: String,
    dataoid: String,
    routername: String
  },
  data: function () {
    return {
      divIdentifier: String,
      buildForm: Object,
      loading: false
    }
  },
  watch: {
    formcode: function () {
      console.log('watch')
      this.waitForFormio()
    },
    '$i18n.locale': {
      handler (val) {
        this.waitForFormio()
      },
      immediate: true
    }
  },
  methods: {
    getInit () {
      try {
        // SHOW FORM
        var that = this
        if (that.formcode != null && that.formcode.length > 0) {
          if (that.dataoid != null && that.dataoid.length > 0) {
            that.initFromDataWithOid(that)
          } else {
            // show existing form without data
            getForm(this.formcode)
              .then(function (response) {
                if (!response.i18nJson) {
                  response.i18nJson = null
                }
                window.Formio.createForm(
                  document.getElementById(that.divIdentifier),
                  JSON.parse(response.jsonSchema), JSON.parse(response.i18nJson)
                ).then(function (build) {
                  that.buildForm = build
                  if (that.$i18n.locale) {
                    that.buildForm.language = that.$i18n.locale.toUpperCase()
                  }
                  window.setLanguage = function (lang) {
                    that.buildForm.language = lang
                  }
                  that.buildForm.on('redirect', function (redirecto) {
                    that.checkRedirect(redirecto, that)
                  })
                  that.buildForm.on('submit', function (submission) {
                    createData(
                      that.formcode,
                      that.cleanSubmmision(submission, that)
                    )
                      .then(function () {
                        that.buildForm.emit('submitDone', that.cleanSubmmision(submission, that))
                      })
                      .catch(function (error) {
                        console.log(error)
                      })
                    document
                      .querySelectorAll('.fa-refresh.fa-spin')
                      .forEach((el) => el.remove())
                  })
                })
                setTimeout(function () {
                  that.loading = false
                }, 1200)
              })
              .catch(function (error) {
                console.log(error)
                setTimeout(function () {
                  that.loading = false
                }, 1200)
              })
          }
        }
      } catch (e) {
        console.log(e)
      }
    },
    waitForFormio: function () {
      var that = this
      that.loading = true
      if (window.Formio) {
        that.getInit()
      } else {
        setTimeout(() => {
          that.waitForFormio()
        }, 5)
      }
    },
    checkRedirect: function (redirecto, that) {
      that.$router.push({ path: `/forms/${redirecto.formcode}/${redirecto.dataoid}` })
    },
    initFromDataWithOid: function (that) {
      getData(that.formcode, that.dataoid).then(function (responsedata) {
        var resp = responsedata
        if (!resp.i18nJson) {
          resp.i18nJson = null
        }
        window.Formio.createForm(
          document.getElementById(that.divIdentifier),
          resp.schema, JSON.parse(resp.i18nJson)
        ).then(function (build) {
          that.buildForm = build
          that.buildForm.submission = {
            data: resp.data[0]
          }
          if (that.$i18n.locale) {
            that.buildForm.language = that.$i18n.locale.toUpperCase()
          }
          window.setLanguage = function (lang) {
            that.buildForm.language = lang
          }
          that.buildForm.on('redirect', function (redirecto) {
            that.$router.push({ path: `/forms/${redirecto.formcode}/${redirecto.dataoid}` })
          })
          that.buildForm.on('submit', function (submission) {
            updateData(
              that.formcode,
              that.dataoid,
              that.cleanSubmmision(submission, that)
            )
              .then(function () {
                that.buildForm.emit('submitDone', that.cleanSubmmision(submission, that))
              })
              .catch(function (error) {
                console.log(error)
              })
            document
              .querySelectorAll('.fa-refresh.fa-spin')
              .forEach((el) => el.remove())
          })
        })
        setTimeout(function () {
          that.loading = false
        }, 1200)
      })
    },
    initFromDataSourceWithOid: function (that, msg, count) {
      const promises = []
      const getDat = getData(that.formcode, that.dataoid).then(res => ({ res: res, entity: true }))
      promises.push(getDat)
      if (msg && msg.length > 0) {
        for (var i = 0; i < msg.length; i++) {
          const dsname = msg[i].ds
          const promise = resolveDataSource(msg[i]).then(res => ({ res: res, ds: dsname, entity: false }))
          promises.push(promise)
        }
      }

      Promise.all(promises).then(function (respDatasource) {
        console.log(respDatasource)
        var resp
        for (let i = 0; i < respDatasource.length; i++) {
          if (respDatasource[i].entity) {
            resp = respDatasource[i].res
          }
        }
        for (let i = 0; i < respDatasource.length; i++) {
          if (!respDatasource[i].entity) {
            resp.data[0][respDatasource[i].ds] = respDatasource[i].res
          }
        }
        if (!resp.i18nJson) {
          resp.i18nJson = null
        }
        window.Formio.createForm(
          document.getElementById(that.divIdentifier),
          resp.schema, JSON.parse(resp.i18nJson)
        ).then(function (build) {
          that.buildForm = build
          that.buildForm.submission = {
            data: resp.data[0]
          }
          if (that.$i18n.locale) {
            that.buildForm.language = that.$i18n.locale.toUpperCase()
          }
          window.setLanguage = function (lang) {
            that.buildForm.language = lang
          }
          that.buildForm.on('redirect', function (redirecto) {
            that.$router.push({ path: `/forms/${redirecto.formcode}/${redirecto.dataoid}` })
          })
          that.buildForm.on('submit', function (submission) {
            updateData(
              that.formcode,
              that.dataoid,
              that.cleanSubmmision(submission, that)
            )
              .then(function () {
                that.buildForm.emit('submitDone', that.cleanSubmmision(submission, that))
              })
              .catch(function (error) {
                console.log(error)
              })
            document
              .querySelectorAll('.fa-refresh.fa-spin')
              .forEach((el) => el.remove())
          })
          setTimeout(function () {
            that.loading = false
          }, 1200)
        })
      }).catch(() => {
        if (count > 0) {
          that.initFromDataSourceWithOid(that, msg, count--)
        }
      })
    },
    cleanSubmmision: function (submission, that) {
      if (that.buildForm.components && that.buildForm.components.length > 0) {
        for (var i = 0; i < that.buildForm.components.length; i++) {
          if (that.buildForm.components[i].component && that.buildForm.components[i].component.type === 'button') {
            that.deletePropoertyPath(submission, that.buildForm.components[i].component.key)
          }
        }
      }
      return submission
    },
    deletePropoertyPath: function (obj, path) {
      if (!obj || !path) {
        return
      }
      if (typeof path === 'string') {
        path = path.split('.')
      }
      for (var i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]]
        if (typeof obj === 'undefined') {
          return
        }
      }
      delete obj[path.pop()]
    },
    unmounted: function () {
    },
    mounted: function () {
      console.log('mounted show')
      this.waitForFormio()
    },
    beforeMount: function () {
    }
  }
}
</script>
<style lang="scss" >
#builder {
  padding: 20px !important;
}

.formio-component-datagrid .datagrid-table,
.formio-component-datagrid .datagrid-table td,
.formio-component-datagrid .datagrid-table th {
  border: 0px solid #ddd !important;
  padding: 10px;
}

a {
  text-decoration: none !important;
}

.max50vh {
  max-height: 50vh;
}</style>
