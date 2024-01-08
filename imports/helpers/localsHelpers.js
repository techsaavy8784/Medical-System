/***** all common helpers related to Locals will be added here *****/

export const localsHelpers = {
    getLocals() {
        return Session.get("locals");
    }
};