/***** example file how helpers can be added in future *****/
export const userHelpers = {
    userRole() {
        return Session.get('userRole');
    }
};