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
      console.log(d);

      d.address = d.address.split('\\n').join('<br/>')

      d.emv = this.formatNumber(d.emv);
      d.bav = this.formatNumber(d.bav);
      d.tbea = this.formatNumber(d.tbea);
      d.tba = this.formatNumber(d.tba);
      d.propertytax = this.formatNumber(d.propertytax);
      console.log(Mustache.to_html(this.template,d));
      this.$el.html(Mustache.to_html(this.template,d));

      return this;
    },

    formatNumber: function(number) {
      return numeral(number).format('$0.00a');
    },


    fetch: function(bbl) {
      var that=this;
      //get data for the selected lot
      var sql = new cartodb.SQL({ user: 'cwhong' });
      var query = Mustache.render("SELECT a.*,b.address as streetaddress FROM june15bbls a INNER JOIN pluto15v1 b ON a.bbl = b.bbl WHERE a.bbl = '{{bbl}}'",{bbl: bbl});
      sql.execute(query)
      .on('done',function(data){
        var lotData = data.rows[0];
        //now get exemptions and abatements
        var query = Mustache.render("SELECT detail, amount, type FROM june15exab WHERE bbl = {{bbl}}",{bbl: bbl});
        sql.execute(query)
        .on('done',function(data){
          console.log(data);
          lotData.exemptions = [];
          lotData.abatements = [];
          //create exemption and abatements array in lotData, push each element
          if(data.rows.length>0) {
     

            for(var i=0; i<data.rows.length; i++) {
              var d = data.rows[i];
              if(d.type == 'exemption') {
                lotData.exemptions.push(d);
              }

              if(d.type == 'abatement') {
                lotData.abatements.push(d);
              }
            };
            
          };
          console.log("lotdata",lotData);
          that.model.set(lotData);
        });

        
      });
    }

  });
})(jQuery);
