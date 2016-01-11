/*global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `completed` attributes.
  app.LotSidebarModel = Backbone.Model.extend({
    // Default attributes for the todo
    // and ensure that each todo created has `title` and `completed` keys.
    fetch: function(bbl) {
      console.log('LotSidebarModel.fetch()');
      var that=this;

      console.log(bbl)

      //get data for the selected lot
      var sql = new cartodb.SQL({ user: 'cwhong' });
      var query = Mustache.render("SELECT a.*,b.address as streetaddress FROM june15bbls a LEFT JOIN pluto15v1 b ON a.bbl = b.bbl WHERE a.bbl = '{{bbl}}'",{bbl: bbl});
      sql.execute(query)
      .on('done',function(data){
        var lotData = data.rows[0];
        //now get exemptions and abatements
        var query = Mustache.render("SELECT detail, amount, type FROM june15exab WHERE bbl = {{bbl}}",{bbl: bbl});
        sql.execute(query)
        .on('done',function(data){
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




          //clean things up a bit for screen display
          lotData.address = lotData.address.split('\\n').join('<br/>');
          lotData.emv = that.formatNumber(lotData.emv);
          lotData.bav = that.formatNumber(lotData.bav);
          lotData.tbea = that.formatNumber(lotData.tbea);
          lotData.tba = that.formatNumber(lotData.tba);
          lotData.propertytax = that.formatNumber(lotData.propertytax);


          console.log('fetched data',lotData);
          that.set(lotData);

                //show details OR condo list
            //check if condo, if so render
          if (lotData.condo=="lot") {
            
           
            app.appView.condoListView.fetch({
              condonumber: lotData.condonumber,
              borough: lotData.bbl.toString().charAt(0)
            });
        
          } else {
          
            app.appView.lotDetailsView.render();
          }
           
        });
      });
    },    

    formatNumber: function(number) {
      return numeral(number).format('$0.00a');
    }
  });
})();
