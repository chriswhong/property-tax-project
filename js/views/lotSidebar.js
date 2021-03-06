/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function ($) {
  'use strict';

  app.LotSidebarView = Backbone.View.extend({

    tagName:  'div',
    className: 'lot-sidebar',

    template: $('#lot-sidebar-template').html(),

    initialize: function () {
       this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      console.log('render');
      var d = this.model.toJSON();

      this.$el.html(Mustache.to_html(this.template,d));

      return this;
    }
  




    

  });
})(jQuery);
