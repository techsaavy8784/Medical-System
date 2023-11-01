import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
// import { Meteor } from "meteor/meteor"
import {Router} from "meteor/iron:router"
import 'bootstrap/dist/js/bootstrap.bundle';
import 'bootstrap/dist/css/bootstrap.css'

import './main.html';
import './login'
import './home'
import './header'



Router.route('/', function () {
  this.render('home');
});

Router.route('/login', function () {
  this.render('login');
});

// Create a 404 route (catch-all)
// Router.route('*', function () {
//   this.render('notFound');
// });
