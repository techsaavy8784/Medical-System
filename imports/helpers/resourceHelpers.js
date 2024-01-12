import {Session} from "meteor/session";

/***** all common helpers related to resources will be added here *****/

export const resourceHelpers = {
    openActiveResourceModal() {
        let activeResourceType = Session.get("activeResourceType");
        console.log(activeResourceType)
        if(activeResourceType){

        } else {
            $("#SearchResourceModal").modal("show");
        }
    }
};