import './currentPatient.html'
import { Template } from "meteor/templating"
import { Session } from "meteor/session"
import { ReactiveVar } from "meteor/reactive-var"

// async buildQuery(pageChange = false) {
//     if (pageChange) {
//         const { id } = this.queryCacheDocs;
//         const _query = `/Cache/${id}/${this.currentPage}`;
//         this.query = _query;
//     } else {
//         let base = this.BASE_QUERY;
//         const { startDate, endData, documentType } = this.filters;
//         if (startDate !== undefined) {
//             base += `&period=ge${startDate}`;
//         }
//         if (endData !== undefined) {
//             base += `&period=le${endData}`;
//         }
//         if (documentType !== null) {
//             base += `&type=${documentType}`;
//         }
//         this.query = base;
//     }
//     await this.fetchData();
// },

Template.currentPatient.onCreated(function currentPatientOnCreated() {

})

Template.currentPatient.helpers({
    currentPatientInfo() {
        return Session.get("currentPatientInfo")
    }
})

Template.sidebar.onCreated(function sidebarOnCreated() {
    this.selectedResourceItem = new ReactiveVar("")
});

Template.sidebar.helpers({
    isActive(item) {
        const activeItem = Template.instance().selectedResourceItem.get();
        console.log("isActive", activeItem)
        console.log("item", item)
        return item === activeItem ? 'active' : '';
    }
})

Template.sidebar.events({
    'click .resource-item'(event, instance) {
        const clickedItem = event.currentTarget.id;
        instance.selectedResourceItem.set(clickedItem)
        Session.set("resourceType", clickedItem)
        // $('#sidebar-nav-patient a').click(function(e) {
            $('#sidebar-nav-patient a').removeClass('current_page_item');
            $(`#${clickedItem}`).addClass('current_page_item');
        // });
    }
})

Template.searchPatientResource.onCreated(function searchPatientOnCreated() {
    // this.resourceType = new ReactiveVar("")
    this.startDate = new ReactiveVar("")
    this.endDate = new ReactiveVar("")
    this.documentType = new ReactiveVar("")
    this.filterCount = new ReactiveVar("")
    this.filterCount = new ReactiveVar("")

    this.buildQuery = () => {
        let baseURL = "";
        baseURL += Session.get("resourceType");
        baseURL += `?patient=${Session.get("currentPatientID")}`;
        const startDate = this.startDate.get();
        const endDate = this.endDate.get();
        const documentType = this.documentType.get();
        const filterCount = this.filterCount.get();
        if (filterCount !== "") {
            baseURL += `&_count=${filterCount}`
        } else {
            baseURL += `&_count=10`;
        }
        if (startDate !== "") {
            baseURL += `&period=ge${startDate}`;
        }
        if (endDate !== "") {
            baseURL += `&period=le${endDate}`;
        }
        if (documentType !== "") {
            baseURL += `&type=${documentType}`;
        }
        return baseURL;
    }
})

Template.searchPatientResource.helpers({
    // resourceType() {
    //     return Template.instance().resourceType.get();
    // },
    startDate() {
        return Template.instance().startDate.get();
    },
    endDate() {
        return Template.instance().endDate.get();
    },
    documentType() {
        return Template.instance().documentType.get();
    },
    filterCount() {
        return Template.instance().filterCount.get();
    },
})

Template.searchPatientResource.events({
    'change .filter-start-date'(event, instance) {
        const startDate = event.target.value;
        instance.startDate.set(startDate)
		console.log("startDate", startDate);
        console.log("query---", instance.buildQuery())
    },
    'change .filter-end-date'(event, instance) {
        const endDate = event.target.value;
        instance.endDate.set(endDate)
        console.log("query---", instance.buildQuery())
		console.log("endDate", endDate);
    },
    'change .filter-document-type'(event, instance) {
        const documentType = event.target.value;
        instance.documentType.set(documentType)
        console.log("query---", instance.buildQuery())
		console.log("documentType", documentType);
    },
    'change .filter-patient-count'(event, instance) {
        const filterCount = event.target.value;
        instance.filterCount.set(filterCount)
        console.log("query---", instance.buildQuery())
		console.log("filterCount", filterCount);
    },
});

// Template.searchPatientOnCreated.onRendered({

// })