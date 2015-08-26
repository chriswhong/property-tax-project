/*global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Todo Router
  // ----------
  app.Router = Backbone.Router.extend({
    routes: {
      "map/:type": "getMap",
       "*actions": "defaultRoute" 
    },

    getMap: function(type) {
      console.log('getMap()');
      switch(type) {
        case 'lots':
          app.appView.showLots();
          break;
        case 'councildistricts':
          app.appView.showCouncilDistricts();
          break;
      }
    },

    defaultRoute: function(actions) {
      console.log('defaultRoute');
      app.appView.showLots();
    }


  });

 
})();
