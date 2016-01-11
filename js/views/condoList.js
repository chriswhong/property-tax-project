/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function ($) {
  'use strict';

  app.CondoListView = Backbone.View.extend({

    tagName:  'div',
    className: 'condoList',

    template: $('#condoList-template').html(),

    events: {
      'click .list-group-item  ':'condoDetails'
    },

    initialize: function () {
       //this.listenTo(this.model, 'change', this.render);
    },

    render: function (d) {
  
    console.log(d);
     this.$el.html(Mustache.to_html(this.template,d));
    

      return this;
    },

    condoDetails: function (e) {

      var bbl = $(e.target).data('bbl');
      app.appView.lotSidebarModel.fetch( bbl );
    },

    fetch: function (params) {
    //fetch condo list - should this be a model?  
      var that=this;

      var sql = new cartodb.SQL({ user: 'cwhong' });
      var query = Mustache.render("SELECT * FROM june15bbls WHERE condonumber = '{{condonumber}}' AND condo = 'unit' AND LEFT(bbl::text,1) = '{{borough}}'", params);
      sql.execute(query)
      .on('done',function(data){
        var d = data.rows;

        d.forEach(function (row) {
          row.address=row.address.split('\\n').join('<br/>');
        });

        that.render(d);
      })
    },

    empty: function () {
      this.$el.empty();
    }


 
  });
})(jQuery);
