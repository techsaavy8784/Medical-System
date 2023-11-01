import { Meteor } from "meteor/meteor"
import {Router} from "meteor/iron:router"

// DISABLE QUERY STRING COMPATIBILITY
// WITH OLDER FlowRouter AND Meteor RELEASES

Meteor.startup(() => {
    
// Router.configure({
//     layoutTemplate: 'mainContainer'
//   });


})

// Router.configure({
//     layoutTemplate: 'mainContainer'
//   });

Router.route('/', function () {
    this.render('home');
  });
  
  Router.route('/login', function () {
    this.render('login');
  });
  
  // Create a 404 route (catch-all)
  Router.route('*', function () {
    this.render('notFound');
  });