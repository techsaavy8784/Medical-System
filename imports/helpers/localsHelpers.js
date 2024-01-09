import {Session} from "meteor/session";

/***** all common helpers related to Locals will be added here *****/

export const localsHelpers = {
    getLocals() {
        return Session.get("locals");
    },
    //it will always return opposite system URL
    getdestSystemId() {
        if (Session.get("isActive") === "local") {
            return Session.get("remotes")[0]?.systems[0].id;
        } else {
            return Session.get("locals")[0]?.systems[0].id;
        }
    }
};