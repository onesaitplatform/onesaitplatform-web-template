<template>
  <div v-loading="!dashboardReady" class="wrapper-dashboard">
    <div v-pre>
      <dashboard
        wrapper="true"
        editmode="false"
        iframe="true"
        selectedpage="0"
        public="false"
        class="flex layout-column"
        v-pre
      ></dashboard>
    </div>
  </div>
</template>

<script>
export default {
  /* global angular */
  /* eslint no-undef: "error" */
  name: "dashboard-wrapper",
  props: [
    "id",
    "token",
    "model",
    "i18n",
    "dashboard",
    "editmode",
    "params",
    "platformbase",
    "initialDatalink",
    "dashboardReady"
  ],
  created: function () {
    this.loaded = false;
    this.getURLParameters = function () {
      var sPageURL = window.location.search.substring(1);
      var sURLVariables = sPageURL.split("&");
      var urlParametersMap = {};
      for (var i = 0; i < sURLVariables.length; i++) {
        if (sURLVariables[i].length > 0) {
          var sParameterName = sURLVariables[i].split("=");
          if (sParameterName[0] !== "oauthtoken") {
            urlParametersMap[sParameterName[0]] = sParameterName[1];
          }
        }
      }
      return urlParametersMap;
    };
    this.isEmptyJson = function (obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    };
    this.setConfig = function (token, params, platformbase, initialDatalink) {
      this.__env = window.__env || {};
      this.__env.socketEndpointConnect =
        (platformbase ? platformbase : "") + "/dashboardengine/dsengine/solver";
      this.__env.dashboardEngineProtocol = "rest"; // ['websocket','rest']
      this.__env.socketEndpointSend = "/dsengine/solver";
      this.__env.socketEndpointSubscribe = "/dsengine/broker";
      this.__env.endpointControlPanel =
        (platformbase ? platformbase : "") + "/controlpanel";
      this.__env.endpointDashboardEngine =
        (platformbase ? platformbase : "") + "/dashboardengine";
      this.__env.dashboardEngineUsername = "";
      this.__env.dashboardEnginePassword = "";
      sessionStorage.setItem('dashboardEngineOauthtoken', token)
      // this.__env.dashboardEngineOauthtoken = token;
      this.__env.dashboardEngineUserRole = sessionStorage.getItem("role");
      this.__env.dashboardEngineLoginRest = "/loginRest";
      this.__env.enableDebug = false;
      if (!params) {
        this.__env.urlParameters = this.getURLParameters();
      } else {
        this.__env.urlParameters = params;
      }
      // initial datalinks add-on
      if (initialDatalink) {
        this.__env.initialDatalink = initialDatalink        
      }
      this.__env.dashboardEngineBungleMode = true;

      angular.module("dashboardFramework").constant("__env", this.__env);
      window.__env = this.__env;      
    };
    this.setCacheValue = function (model) {
      angular.module("dashboardFramework").value("cacheBoard", model);
    };
    this.drawError = function (error) {
      document.getElementsByTagName("dashboard")[0].innerHTML =
        "<div style='padding:15px;background:#fbecec'><div class='no-data-title'>Dashboard Engine Error " +
        (error.status ? error.status : "") +
        "</div><div class='no-data-text'>" +
        (error.config ? "Rest Call: " + error.config.url + ". " : "") +
        "Detail: " +
        (error.data ? JSON.stringify(error.data) : error) +
        "</div></div>";
    };
    this.clearApp = function (parent, subapp) {
      if (typeof angular !== "undefined" && typeof subapp !== "undefined") {
        var ngapp = angular.element(subapp);
        if (ngapp.injector() && ngapp.injector().get("$rootScope")) {
          var $rootScope = ngapp.injector().get("$rootScope");
          ngapp.data("$injector", "");
          $rootScope.$destroy();
          ngapp.empty();
        }
        this.nginst = null;
      }
    };
    this.generateDSApi = function (appRootNode) {
      var scope = this;
      var app = angular.element(appRootNode);
      var api = app.isolateScope().vm.api;
      
      api.sendValue = function (gadgetOrigin, key, value) {
        api.sendFilter(gadgetOrigin, key, value, null, "value");
      };
      api.sendFilter = function (gadgetOrigin, key, value, op, typeAction) {
        var jsonModel = {}
        // FOR MULTIPLE FILTER SENDFILTER 
        if (typeof key === 'string') {
          jsonModel[key] = {
            value: value,
            id: gadgetOrigin,
            op: op ? op : "=",
            typeAction: typeAction ? typeAction : "filter",
          };
        } else {
          // multiple filters in one id, key as object
          jsonModel = key
        }
       
        app
          .injector()
          .get("interactionService")
          .sendBroadcastFilter(gadgetOrigin, jsonModel)
      };
      api.httpService = app.injector().get("httpService");
      api.ds = {};
      api.ds.get = app.injector().get("datasourceSolverService").get;
      api.ds.getOne = app.injector().get("datasourceSolverService").getOne;
      api.ds.from = app.injector().get("datasourceSolverService").from;
      api.msgApi = window.DSMessageApi;
      api.getModel = function () {
        return app.isolateScope().vm.dashboard;
      };
      api.setModel = function (dashboard) {
        return (app.isolateScope().vm.dashboard = dashboard);
      };
      api.getDropElementEvent = function () {
        return app.isolateScope().vm.dashboard.gridOptions
          .emptyCellDropCallback;
      };
      api.setDropElementEvent = function (dropElementEvent) {
        app.isolateScope().vm.dashboard.gridOptions.emptyCellDropCallback =
          dropElementEvent;
      };
      api.enableEventEdit = function () {
        app.isolateScope().vm.dashboard.gridOptions.eventedit = true;
      };
      api.disableEventEdit = function () {
        app.isolateScope().vm.dashboard.gridOptions.eventedit = false;
      };
      api.disableToolBar = function () { 
        console.log('disable toolbar...')         
        app.isolateScope().vm.dashboard.editButtonsIframe = {
          urlParameterButton: false,
          trashButton: false,
          editGadgetMenu: true,
          closeButton: false,
          configButton: false,
          dataLinkButton: false,
          addElementButton: false,
          moveToolBarButton: false,
          active: false,
          filterGadgetMenu: true,
          removeGadgetMenu: true
        }
        api.forceRender()
      }
      api.datalink = app.injector().get("interactionService");
      api.utilService =  app.injector().get("utilsService")
      api.params = app.injector().get("urlParamService");
      api.sendParam = app.injector().get("urlParamService").sendBroadcastParam;
      api.sendParams = app.injector().get("urlParamService").sendBroadcastParams;
      api.gmanagerService = app.injector().get("gadgetManagerService");
      api.favoriteService = app.injector().get("favoriteGadgetService");
      api.setInlineDragType = function (type) {
        return (app.isolateScope().vm.dashboard.dragGadgetType = type);
      };
      api.forceRender = function () {
        app.injector().get("utilsService").forceRender(app.isolateScope());
      };
      api.clearCache = function (dashboard) {
        if (dashboard) {
          scope.setCacheValue({});
        } else {
          scope.setCacheValue({});
        }
      };
      api.template = {
        templateToInitParams: function (str) {
          var regexTagHTML = /<![\-\-\s\w\>\=\"\'\,\:\+\_\/]*\-->/g
          var regexTagJS = /\/\*[\-\-\s\w\>\=\"\'\,\:\+\_\/]*\*\//g
          var regexName = /name\s*=\s*\"[\s\w\>\=\-\'\+\_\/]*\s*\"/g
          var regexOptions = /options\s*=\s*\"[\s\w\>\=\-\'\:\,\+\_\/]*\s*\"/g
          var found = []

          function searchTag(regex, str) {
            var m
            var found = []
            while ((m = regex.exec(str)) !== null) {
              if (m.index === regex.lastIndex) {
                regex.lastIndex++
              }
              m.forEach(function (item, index, arr) {
                found.push(arr[0])
              })
            }
            return found
          }

          function searchTagContentName(regex, str) {
            var m
            var content
            while ((m = regex.exec(str)) !== null) {
              if (m.index === regex.lastIndex) {
                regex.lastIndex++
              }
              m.forEach(function (item, index, arr) {
                content = arr[0].match(/"([^"]+)"/)[1]
              })
            }
            return content
          }

          function searchTagContentOptions(regex, str) {
            var m
            var content = ' '
            while ((m = regex.exec(str)) !== null) {
              if (m.index === regex.lastIndex) {
                regex.lastIndex++
              }
              m.forEach(function (item, index, arr) {
                content = arr[0].match(/"([^"]+)"/)[1]
              })
            }

            return content.split(',')
          }

          found = searchTag(regexTagHTML, str).concat(
            searchTag(regexTagJS, str),
          )

          found.unique = (function unique(a) {
            return function () {
              return this.filter(a)
            }
          })(function (a, b, c) {
            return c.indexOf(a, b + 1) < 0
          })
          found = found.unique()
          var parserList = []
          for (var i = 0; i < found.length; i++) {
            var tag = found[i]
            if (
              tag.replace(/\s/g, '').search('type="text"') >= 0 &&
              tag.replace(/\s/g, '').search('label-osp') >= 0
            ) {
              parserList.push({
                label: searchTagContentName(regexName, tag),
                value: 'parameterTextLabel',
                type: 'labelsText',
              })
            } else if (
              tag.replace(/\s/g, '').search('type="number"') >= 0 &&
              tag.replace(/\s/g, '').search('label-osp') >= 0
            ) {
              parserList.push({
                label: searchTagContentName(regexName, tag),
                value: 0,
                type: 'labelsNumber',
              })
            } else if (
              tag.replace(/\s/g, '').search('type="ds"') >= 0 &&
              tag.replace(/\s/g, '').search('label-osp') >= 0
            ) {
              parserList.push({
                label: searchTagContentName(regexName, tag),
                value: 'parameterDsLabel',
                type: 'labelsds',
              })
            } else if (
              tag.replace(/\s/g, '').search('type="ds_parameter"') >= 0 &&
              tag.replace(/\s/g, '').search('label-osp') >= 0
            ) {
              parserList.push({
                label: searchTagContentName(regexName, tag),
                value: 'parameterNameDsLabel',
                type: 'labelsdspropertie',
              })
            } else if (
              tag.replace(/\s/g, '').search('type="ds"') >= 0 &&
              tag.replace(/\s/g, '').search('select-osp') >= 0
            ) {
              var optionsValue = searchTagContentOptions(regexOptions, tag)
              parserList.push({
                label: searchTagContentName(regexName, tag),
                value: 'parameterSelectLabel',
                type: 'selects',
                optionsValue: optionsValue,
              })
            }
          }
          return parserList
        },
      }
      return api;
    };
    this.loadApp = function (id, token, appRootNode, i18n, api, dashboard) {
      var scope = this;
      appRootNode.setAttribute(
        "editmode",
        scope.editmode ? scope.editmode : "false"
      );
      //hide styling button
      var styleSheet = document.styleSheets[document.styleSheets.length - 1];

      var ruleNum = styleSheet.cssRules.length;
      if (scope.editmode) {
        if (styleSheet) {
          styleSheet.insertRule(
            "md-menu-content > md-menu-item:nth-child(2){display:none !important;}",
            ruleNum
          );
        }
      } else {
        if (styleSheet) {
          styleSheet.insertRule(
            "md-menu-content > md-menu-item:nth-child(2){display:block !important;}",
            ruleNum
          );
        }
      }

      if (i18n == true) {
        fetch(
          this.__env.endpointControlPanel + "/dashboards/i18n/" + dashboard,
          {
            method: "get",
            headers: new Headers({
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            }),
          }
        )
          .then(function (res) {
            if (res && res.status == 401) {
              res.config = {
                url:
                  this.__env.endpointControlPanel +
                  "/dashboards/i18n/" +
                  dashboard,
              };
              res.data = res.statusText;
              throw res;
            }
            return res.json();
          })
          .then(function (i18n) {
            scope.__env.i18njson = i18n;
            if (!scope.nginst) {
              scope.nginst = angular.bootstrap(angular.element(appRootNode), [
                "dashboardFramework",
              ]);
            }
            scope.api = scope.generateDSApi(appRootNode);
            if (!window.DSApi) {
              window.DSApi = {};
            }
            window.DSApi[id] = {};
            window.DSApi[id].api = scope.api;

            window.i18n = new VueI18n({
              locale: "ES",
              fallbackLocale: "EN",
              // link messages with internacionalization json on controlpanel
              messages: __env.i18njson.languages,
            });
          });
      } else {
        if (typeof i18n !== "undefined") {
          scope.__env.i18njson = i18n;
        }
        if (!scope.nginst) {
          scope.nginst = angular.bootstrap(angular.element(appRootNode), [
            "dashboardFramework",
          ]);
        }
        scope.api = scope.generateDSApi(appRootNode);
        if (!window.DSApi) {
          window.DSApi = {};
        }
        window.DSApi[id] = {};
        window.DSApi[id].api = scope.api;
      }
    };
  },  
  mounted: function () {
    var app = this   
    
    // NEW WAY
    if (this.dashboardReady) {
      this.startApp();
    }
  },
  watch: {
    dashboardReady: function (newVal) {
      // when true, all dependencies to load dashboard are loaded, so startApp
      if (newVal) {
        this.startApp();
      }
    },
    dashboard: function (newVal) {
      // watch it
      var parent = this.$el;
      var subapp = this.$el.getElementsByTagName("dashboard")[0];
      this.clearApp(parent, subapp);
      subapp.id = this.dashboard;
      if (this.dashboardReady) {
        this.setConfig(
          this.token,
          this.params,
          this.platformbase,
          this.initialDatalink
        ); // agrego initial
        this.loadApp(this.id, this.token, subapp, this.i18n, this.api, newVal);
      }
    },
    params: function (newVal) {
      // watch it
      var parent = this.$el;
      var subapp = this.$el.getElementsByTagName("dashboard")[0];
      this.clearApp(parent, subapp);
      subapp.id = this.dashboard;
      this.setConfig(
        this.token,
        this.params,
        this.platformbase,
        this.initialDatalink
      );
      if (this.DashboardAppLoaded) {
        this.loadApp(this.id, this.token, subapp, this.i18n, this.api, newVal);
      }
    },
    initialDatalink: function (newVal) {
      // watch it
      console.log(
        "DASHBOARD INITIAL FILTERS APPLIED: ",
        JSON.stringify(newVal)
      );
      if (newVal.constructor === Object && Object.entries(newVal).length > 0) {
        this.setConfig(this.token, this.params, this.platformbase, newVal);
      }
    },
  },
  beforeDestroy: function () {
    this.clearApp(this.$el, this.$el.getElementsByTagName("dashboard")[0]);
  },
  data: function () {
    return {
      DashboardAppLoaded: !!window.DSApi, //var for loaded dashboard
      orderState: {},
      loadHeaderLibs: true // dynamical loading of dashboard´s resources      
    }
  },  
  methods: {
    startApp: function () {
      this.clearApp();
      var scope = this;
      scope.setConfig(
        scope.token,
        scope.params,
        scope.platformbase,
        scope.initialDatalink
      );
      if (scope.model) {
        // scope.setCacheValue(scope.model);
      }
      var subapp = scope.$el.getElementsByTagName("dashboard")[0];
      subapp.id = scope.dashboard;
      scope.loadApp(
        scope.id,
        scope.token,
        subapp,
        scope.i18n ? scope.i18n == "true" : false,
        scope.api,
        scope.dashboard
      );
    },
  }  
};
</script>

<style scoped lang="scss">
.wrapper-dashboard {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: scroll;
}
/*.container__dashboard{
  height: 100vh;
  width: 100%;
}*/
</style>
