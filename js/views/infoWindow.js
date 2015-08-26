/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function ($) {
  'use strict';

//View for the Infowindow that follows the mouse when hovering over the map

  app.InfoWindowView = Backbone.View.extend({

    tagName:  'div',
    id: 'infoWindow',

    template: $('#zipInfo-template').html(),

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function () {

      var d = this.model.toJSON();



      //show or hide infoWindow
      (d.visible) ? this.$el.fadeIn(80) : this.$el.fadeOut(80);
    
      //update position using x and y attributes
      this.$el.css({
        'top': d.y + 20,
        'left': d.x + 20
      });

      //pretty print large numbers
      var tiv = this.model.attributes.tiv;
      this.model.set({tivPretty: numeral(tiv).format('$0.0 a')})

      this.$el.html(Mustache.to_html(this.template,d));

      return this;
    },
    destroy: function() {
      this.remove();
      this.unbind();
    }
  });
})(jQuery);
