/*global $ */
/*jshint unused:false */
var app = app || {};
var ENTER_KEY = 13;
var ESC_KEY = 27;

$(function () {
  'use strict';
  console.log("app from app.js",app)

  // kick things off by creating the `App`
  app.appView = new app.AppView();

});
