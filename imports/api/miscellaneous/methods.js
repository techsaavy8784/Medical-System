import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { baseUrl, versionId } from "/imports/utils/constants";

Meteor.methods({
    getTagLine: function() {
        // Make an HTTP GET request to the getTagLine API endpoint
        console.log("baseUrl", baseUrl);
        const requestUrl = baseUrl + "TagLine";

        try {
            console.log("requestUrl", requestUrl);
            const res = HTTP.get(requestUrl);
            // const { data } = res;
            console.log("tagLineResponse: ", res);
            return res;
        } catch (error) {
            console.error("Error fetching tagline:", error);
            throw new Meteor.Error('tagline-fetch-failed', 'Failed to fetch tagline');
        }
    },
    getVersionId: function() {
        return versionId
    },
});

/*
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

Meteor.startup(() => {
  // code to run on server at startup
});

const baseUrl = Meteor.settings.public.LOGIN_BASE_URL

Meteor.methods({
  loginUser: function (username, password) {
    // Make an HTTP POST request to the authorize API endpoint
    const requestUrl = baseUrl + "authorize";

    logger.info(`Making external API call to: ${requestUrl}`)

    try {
      const response = HTTP.post(requestUrl, {
        data: {
          userName: username,
          password: password
        }
      });

      logger.info('API response:', { response: response.data });
      return response.data;

    } catch (error) {
      logger.error('Error ocurred during the API call: ', error)
      throw new Meteor.Error('login', 'Network connection Error!');
    }

  },
  getTagLine: function() {
    // Make an HTTP GET request to the getTagLine API endpoint

    const requestUrl = baseUrl + "TagLine";
    logger.info(`Making external API call to: ${requestUrl}`)
    try {
      const res = HTTP.get(requestUrl);
      // const { data } = res;
      logger.info('API response:', { response: res });
      return res;
    } catch (error) {
      logger.error('Error occurred during the API call:', error);
      throw new Meteor.Error('tagline-fetch-failed', 'Failed to fetch tagline');
    }
  },
  async patientTestQuery(url, headers) {
    console.log("patientTestQuery")
    try {

      logger.info(`Making external API call to: ${url}`);

      const response = await HTTP.get(url, { headers });

      logger.info('API response:', { response: response.data });
      const { data } = response;
      data.bundle.entry = data.bundle.entry.map(e => {
        let title = data.resourceType;
        if (data.resourceType === "DocumentReference") {
          title = "Document Reference"
        } else if (data.resourceType === "DiagnosticReport") {
          title = "Diagnostic Report"
        }

        e.resource.text.div = e.resource.text.div.split(`<p><b>${title}</b></p>`).join("")
        return {...e, text: e.resource.text}
        });

      return data;
    } catch (error) {
      logger.error('Error occurred during the API call:', error);
      throw new Meteor.Error(error)
    }
  }
});
*/