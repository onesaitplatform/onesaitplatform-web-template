# Template web

The **web template** is a web application developed with the progressive **Vue.js** framework, fully integrated with Onesait Platform.

It allows, through components defined in the platform, to manage security, menus and the different pages from the **OP Forms and Platform Dashboards**. 

These components are **displayed natively** without the use of iframes. In addition, the web application can be extended by creating more components. 

Another feature is being able to **show global filters** to be able to apply them to different dashboards.
You can also activate the favorites functionality, with which the dashboards will not allow you to select and mark as favorites gadgets defined in the dashboards to which the user has access in order to later create your own dashboards.


The menus, initial screens and access to components are managed from a component of the **centralized platform configuration**.

We will give users access to the different resources from the application defined in the platform, which is the space between users that allows sharing resources and making progressive development.

In order to carry out the installation it is necessary to have the **ODS library** token. Since this library is not open source.
To obtain it, contact those responsible for the platform through email support@onesaitplatform.com.

The **conf folder** contains the json files, to be able to create the centralized configuration and internationalization.

The **Node version** to use is **v16.20.2**.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```
