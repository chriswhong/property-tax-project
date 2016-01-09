/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function ($) {
  'use strict';

  app.LotDetailsView = Backbone.View.extend({

    tagName:  'div',
    className: 'lot-details',

    template: $('#lot-details-template').html(),

    initialize: function () {
       //this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      var d = this.model.toJSON();

      this.$el.html(Mustache.to_html(this.template,d));

      return this;
    },

    empty: function () {
      this.$el.empty();
    }



 
  });
})(jQuery);
