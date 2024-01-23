import "./patientMatchModal.html";
Template.patientMatchModal.onCreated(function() {
    Session.set('patientOverRideConfirmed', false);
})

Template.patientMatchModal.helpers({
    values: () => Session.get("matchFailedValues"),
    separator (index)  {
        let matchFailedValues = Session.get("matchFailedValues");
        if(index > 0 && index < matchFailedValues.length - 2){
            if (index % 2 === 1) {
                return '<hr>'
            }
        }
    }
})

Template.patientMatchModal.events({
    'click .cancel-match-modal' (event) {
        Session.set('patientOverRideConfirmed', false);
        $('#patientMatchModal').modal('hide');
    },
    'click .confirm-match-changes' (event) {
        Session.set('patientOverRideConfirmed', true);
        $('#patientMatchModal').modal('hide');
    }
})