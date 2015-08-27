/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
  'use strict';

  //application main view

  app.AppView = Backbone.View.extend({

    el: 'body',

    // listen for mousemove to move the infoWindow
    events: {
      'mousemove #map':'moveInfoWindow',
      'click button.lots':'showLots',
      'click button.councilDistricts':'showCouncilDistricts'
    },

    initialize: function() {

      //add the infoWindowView
      this.infoWindowModel = new app.InfoWindowModel();
      this.infoWindowView = new app.InfoWindowView({model:this.infoWindowModel});
      this.$el.append(this.infoWindowView.render().el)

      //add the sidebarView
      this.sidebarModel = new app.SidebarModel(); 
      this.sidebarView = new app.SidebarView({model:this.sidebarModel});
      this.$el.append(this.sidebarView.render().el);

      //init map
      var map = new L.Map('map', { 
        center: [40.695998,-73.999443],
        zoom: 11
      });

      this.map = map;

      //dark matter basemap
      var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
      }).addTo(map);
      //cartodb published map with asset and weather layers
      var layerUrl = 'https://cwhong.cartodb.com/api/v2/viz/b376f4b2-4bf1-11e5-a95c-0e853d047bba/viz.json';

      var view = this;

      //listen for events to update the url
      map.on('zoomend',function(){view.setURL()});
      map.on('dragend',function(){view.setURL()});

      cartodb.createLayer(map, layerUrl)
      .addTo(map)
      .on('done', function(layer) {
        view.layer = layer;
        view.initializeMap(view, map)
      })
  
    },

    initializeMap: function(view, map) {

      //hide all layers

      this.hideAllLayers();

      var baseAPI = 'https://chriswhong.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT the_geom, cartodb_id FROM nyzctas WHERE cartodb_id = '
      var layerGroup = new L.LayerGroup();
      
      var polygon;
      var currentHover, newFeature = null;


      // layer.on('featureOver', function(ev, pos, latlng, data){
      //   if (view.mode == 'state') {

      //     //update the infoWindowModel
      //     data.visible = true;
      //     view.infoWindowModel.set(data);

      //     //check to see if it's the same feature so we don't waste an API call
      //     if((data.cartodb_id != currentHover || layerGroup.getLayers().length > 1)) {
      //       layerGroup.clearLayers();
            
      //       $.getJSON(baseAPI + data.cartodb_id, function(res) {
          
      //         polygon = res;

      //         newFeature = L.geoJson(res,{
      //           onEachFeature:onEachFeature,
      //           style: {
      //             "color": "steelblue",
      //             "weight": 2,
      //             "opacity": 1
      //           }
      //         });
      //         layerGroup.addLayer(newFeature)
      //         layerGroup.addTo(map);
      //       })
      //       currentHover = data.cartodb_id;
      //     } 
      //   }
      // })
      //   .on('featureOut', function() {
      //     //layerGroup.clearLayers();
      //     view.infoWindowModel.set({'visible':false})
      //   });


        function onEachFeature(feature, layer) {
          layer.on('click', function (e) {

            console.log(feature, layer);

            view.modeChangeZip();
            

            var template = $('#sidebarQuery-template').text();

            var apiCall = Mustache.render(template, feature.properties)
            $.getJSON(apiCall,function(data){
            
              //set new data for sideBarModel here
              view.sidebarModel.set(data.rows[0]);
              view.sidebarView.slideIn();

            });

            

              //console.log(e.target.feature.properties.cartodb_id);
              //bring in the sidebar
              map.fitBounds(layerGroup.getLayers()[0].getBounds());

              newFeature = L.geoJson(polygon,{
                onEachFeature:onEachFeature,
                style: {
                  "color": "red",
                  "weight": 4,
                  "opacity": 1
                }
              });
              view.selectedLayerGroup.clearLayers();
              view.selectedLayerGroup.addLayer(newFeature);
              view.selectedLayerGroup.addTo(map);
          });
        }
        // this.showLots();

        app.router = new app.Router();
        Backbone.history.start();
        console.log('finished initializing map');
      },
 
    showLots: function() {
      this.hideAllLayers();
      this.currentLayer = 'lots';
      $('button.lots').addClass('active');
      this.layer.getSubLayer(0).show();
      //Backbone.history.navigate('map/lots'); 
      this.setURL();
    },

    showCouncilDistricts: function() {
      this.hideAllLayers();
      this.currentLayer = 'councildistricts';
      $('button.councilDistricts').addClass('active');
      this.layer.getSubLayer(1).show();
      this.setURL();
    },

    hideAllLayers: function() {
      var view = this;
      console.log('hide',this)
      view.layer.layers.forEach(function(l,i) {
        view.layer.getSubLayer(i).hide();
      });

      $('button').removeClass('active');
    },

    moveInfoWindow: function (e) {
      //console.log(e.pageX,e.pageY)
      //set x and y in the model for the infowindow
      this.infoWindowModel.set({x:e.pageX,y:e.pageY})
    },

    setURL: function() {
      var zoom = this.map.getZoom();
      var center = this.map.getCenter();
      var zoomCenter = zoom + '/' + center.lat.toFixed(3) + '/' + center.lng.toFixed(3);
    
      Backbone.history.navigate('map/' + this.currentLayer + '/' + zoomCenter); 

    },

    setView: function(zoom, lat, lon) {
      this.map.setView(new L.latLng([lat,lon]),zoom);
    }


  });
})(jQuery);
