/*global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Todo Router
  // ----------
  app.Router = Backbone.Router.extend({
    routes: {
      "map/:type/:zoom/:lat/:lon": "getMap",
       "*actions": "defaultRoute" 
    },

    getMap: function(type,zoom,lat,lon) {
      console.log('getMap()');
      switch(type) {
        case 'lots':
          app.appView.showLots();
          break;
        case 'councildistricts':
          app.appView.showCouncilDistricts();
          break;
      };

      app.appView.setView(zoom,lat,lon);
    },

    defaultRoute: function(actions) { 
      app.appView.showLots();
    }


  });

 
})();
