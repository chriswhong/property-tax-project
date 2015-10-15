/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function ($) {
  'use strict';

//View for the Infowindow that follows the mouse when hovering over the map

  app.SidebarView = Backbone.View.extend({

    tagName:  'div',
    className: 'sidebar',

    template: $('#sidebar-template').html(),

    initialize: function () {
       this.listenTo(this.model, 'change', this.render);
    },

    render: function () {

      var d = this.model.toJSON();
      console.log(d);

      d.emv = this.formatNumber(d.emv);
      d.bav = this.formatNumber(d.bav);
      d.tbea = this.formatNumber(d.tbea);
      d.propertytax = this.formatNumber(d.propertytax);

      this.$el.html(Mustache.to_html(this.template,d));

      return this;
    },

    formatNumber: function(number) {
      return numeral(number).format('$0.00a');
    },


    slideIn: function () {
      this.$el.animate({
        right:0
      },150);
    },

    slideOut: function () {
      this.$el.animate({
        right:'-330px'
      },150);
    }

  });
})(jQuery);
