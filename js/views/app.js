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
      'click button.councilDistricts':'showCouncilDistricts',
      'click button.draw':'showDraw'
    },

    initialize: function() {
      var that = this;

      this.hoverID = -1;

      this.sql = new cartodb.SQL({ user: 'cwhong' });

      //add the infoWindowView
      this.infoWindowModel = new app.InfoWindowModel();
      this.infoWindowView = new app.InfoWindowView({model:this.infoWindowModel});
      this.$el.append(this.infoWindowView.render().el)

      //add the sidebarView
      this.sidebarModel = new app.SidebarModel(); 
      this.sidebarView = new app.SidebarView({model:this.sidebarModel});
      this.$el.append(this.sidebarView.render().el);

      //init map
      this.map  = new L.Map('map', { 
        center: [40.695998,-73.999443],
        zoom: 11
      });

      //dark matter basemap
      var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
      }).addTo(this.map);
      //cartodb published map with asset and weather layers
      var layerUrl = 'https://cwhong.cartodb.com/api/v2/viz/b376f4b2-4bf1-11e5-a95c-0e853d047bba/viz.json';


      //listen for events to update the url
      this.map.on('zoomend',function(){that.setURL()});
      this.map.on('dragend',function(){that.setURL()});

      cartodb.createLayer(this.map, layerUrl)
      .addTo(this.map)
      .on('done', function(layer) {
        that.layer = layer;
        that.initializeMap();
      })
  
      this.leafletDrawInit();

    },

    initializeMap: function() {
      var that = this;
      //hide all layers

      this.hideAllLayers();

      this.councilDistrictsLayer = this.layer.getSubLayer(1);
      this.councilDistrictsLayer.setInteraction(true);
      this.councilDistrictsLayer.setInteractivity('cartodb_id,coundist,propertytax');

   

      this.councilDistrictsLayer.on('featureOver', function(ev, pos, latlng, data){
        //show the infowindow
        var d = {
          visible:true,
          title: 'District ' + data.coundist,
          value: that.formatNumber(data.propertytax)
        };

        that.infoWindowModel.set(d);

        //check to see if it's the same feature so we don't waste an API call
        if(data.cartodb_id != that.hoverID) {
          that.renderPolygon(data.cartodb_id);
          that.hoverID = data.cartodb_id;
        }

      })
        .on('featureOut', function() {
          that.infoWindowModel.set({visible:false});
        })
      ;

      this.lotsLayer = this.layer.getSubLayer(0);
      this.lotsLayer.setInteraction(true);
      this.lotsLayer.setInteractivity('cartodb_id');

      this.lotsLayer.on('featureClick', function(ev, pos, latlng, data){
        console.log(data);
      });

    
        app.router = new app.Router();
        Backbone.history.start();
        console.log('finished initializing map');
      },

    formatNumber: function(number) {
      return numeral(number).format('$0.00a');
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
      this.councilDistrictsLayer.show();
      this.setURL();
    },

    showDraw: function() {
      this.hideAllLayers();
      this.currentLayer = 'lots';
      $('button.draw').addClass('active');
      this.layer.getSubLayer(0).show();

      $('.leaflet-draw-toolbar').show();
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
    },

    fetchPolygonData: function(geometry,callback) {
      geometry = JSON.stringify(geometry);
      console.log(geometry);

      //var query = Mustache.render("SELECT Count(a.cartodb_id) AS policies, Sum(a.tiv) AS tiv, Count(CASE WHEN a.category = 'Office'THEN a.category END) AS office, Count(CASE WHEN a.category = 'Warehouse'THEN a.category END) AS warehouse, Count(CASE WHEN a.category = 'Education'THEN a.category END) AS education, Count(CASE WHEN a.category = 'Medical'THEN a.category END) AS medical, Count(CASE WHEN a.category = 'Factory'THEN a.category END) AS factory FROM ny30k a WHERE ST_CONTAINS(ST_SetSRID(ST_GeomFromGeoJSON('{{{geometry}}}'),4326),a.the_geom)",{geometry:geometry});


      var query = Mustache.render("SELECT count(*), sum(emv) as emv, sum(bav) as bav, sum(tbea) as tbea, sum(tba) as tba, sum(propertytax) as propertytax FROM (SELECT a.the_geom, b.bav,b.emv,b.tba, b.tbea, CASE WHEN b.condo ='' THEN b.propertytax ELSE  c.propertytax END as propertytax FROM pluto15v1 a LEFT JOIN june15bbls b ON a.bbl = b.bbl LEFT JOIN ( SELECT condonumber,sum(propertytax) as propertytax FROM june15bbls WHERE condo = 'unit' GROUP BY condonumber) c ON a.condono::text = c.condonumber) x WHERE ST_CONTAINS(ST_SetSRID(ST_GeomFromGeoJSON('{{{geometry}}}'),4326),a.the_geom)",{geometry:geometry});

      console.log(query);

      this.sql.execute(query)
      .done(function(d) {
          //need to fix this in the db
          d.civ = d.tiv;

          //make up a total insured value
          d.tiv = d.civ * (1 + ((Math.floor(Math.random() * 25) + 1)/100));

          callback(d.rows[0]);
    });

  
    

    },

    renderPolygon: function(cartodb_id) {
      var that = this;
      var baseAPI = 'https://cwhong.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT the_geom, cartodb_id, coundist FROM councildistricts15 WHERE cartodb_id = '
        
      //get the polygon as geoJSON        
      $.getJSON(baseAPI + cartodb_id, function(res) {
    
        if(that.hoverPolygon) {
          that.map.removeLayer(that.hoverPolygon);
        }
        that.hoverPolygon = L.geoJson(res,{
          onEachFeature:onEachFeature,
          style: {
            "color": "steelblue",
            "weight": 2,
            "opacity": 1,
            "fillOpacity": 0
          }
        }).addTo(that.map);
      })
  
      function onEachFeature(feature, layer) {
          layer.on('click', function (e) {
            var template = $('#polygonSummary-template').text();
            that.sql.execute(template, {coundist:feature.properties.coundist})
              .done(function(data) {
                data=data.rows[0];
                data.coundist = feature.properties.coundist;
                that.sidebarModel.set(data);
                that.sidebarView.slideIn();
              })
          });
        }
    },

    leafletDrawInit: function() {
      var that = this;
      //leaflet draw stuff

      var options = {
          position: 'topright',
          draw: {
              polyline:false,
              polygon: {
                  allowIntersection: false, // Restricts shapes to simple polygons
                  drawError: {
                      color: '#e1e100', // Color the shape will turn when intersects
                      message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                  },
                  shapeOptions: {
                      color: '#bada55'
                  }
              },
              circle: true, 
              rectangle: {
                  shapeOptions: {
                      clickable: false
                  }
              },
              marker:false
          }
      };

      var drawControl = new L.Control.Draw(options);
      this.map.addControl(drawControl);
      $('.leaflet-draw-toolbar').hide();

      var customPolygon;
 
      this.map.on('draw:created', function (e) {
        

        var type = e.layerType,
            layer = e.layer;

        that.drawnLayer=e.layer;

        var feature = e.layer.toGeoJSON();

        that.fetchPolygonData(feature.geometry,function(d){
          d.city = d.zipcode = 'Selected Area';

          that.sidebarModel.set(d);
          that.sidebarView.transformData();
          that.sidebarView.slideIn();
        });

        that.map.addLayer(layer);
      });

      this.map.on('draw:drawstart', function (e) {

        that.sidebarView.slideOut();

        console.log('start');
        if (that.drawnLayer) {
          that.map.removeLayer(that.drawnLayer);
        }
      });
    },
  });
})(jQuery);
