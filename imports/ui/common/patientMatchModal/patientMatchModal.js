import "./patientMatchModal.html";

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
    'click .close-match-modal' (event) {
        $('#patientMatchModal').modal('hide');
    }
})