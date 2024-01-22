import "./patientMatchModal.html";
Template.patientMatchModal.onCreated(function() {
    Session.set('patientResourceConfirmed', false);
})

Template.patientMatchModal.helpers({
    values: () => Session.get("matchFailedValues"),
    separator (index)  {
        console.log("INDEX", index)
        console.log("THIS", this)
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
        Session.set('patientResourceConfirmed', false);
        $('#patientMatchModal').modal('hide');
    },
    'click .confirm-match-changes' (event) {
        Session.set('patientResourceConfirmed', true);
        $('#patientMatchModal').modal('hide');
    }
})