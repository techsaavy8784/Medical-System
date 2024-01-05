/***** Global Helpers which can be used in any template *****/

import { Template } from "meteor/templating";

Template.registerHelper('versionId', function () {
    return Meteor.settings.public.VERSION_ID
});