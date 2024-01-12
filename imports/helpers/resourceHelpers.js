import {Session} from "meteor/session";

/***** all common helpers related to resources will be added here *****/

//param modalType ('Save' or 'Search')
export const resourceHelpers = {
    openActiveResourceModal(modalType) {
        let activeResourceType = Session.get("activeResourceType");
        //if activeResourceType not selected alert about it
        if(!activeResourceType){
            alert('Please Select Resource Type');
            return;
        }
        console.log(activeResourceType)
        console.log(`#${activeResourceType}${modalType}Modal`)
        $(`#${activeResourceType}${modalType}Modal`).modal("show");
    }
};