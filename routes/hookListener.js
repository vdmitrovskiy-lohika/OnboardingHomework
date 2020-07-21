const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const axiosInstance = axios.create({
    baseURL: 'https://api.pagerduty.com',
    headers: {
        'Authorization': 'Token token=o6DozjvrP6GzDxao5CF1',
        'Accept': 'application/vnd.pagerduty+json;version=2',
        'From': 'vdmitrovskiy@lohika.com'
    }
});

const getOppositeServiceId = (service) => {
    switch (service) {
        case 'P2PHJKB':
            return 'P7UETSP';
        case 'P7UETSP':
            return 'P2PHJKB';
        default:
            return null;
    }
}

async function createIncident(incident) {
    axiosInstance.post('/incidents', incident);
}

router.post('/', function (req, res, next) {

    req.body.messages.forEach(message => {

        if (message.event !== 'incident.trigger') {
            return;
        }

        const incident = message.incident;
        const requestIncident = {
            incident: {
                type: 'incident',
                title: incident.title,
                incident_key: incident.incident_key,
                body: {
                    type: 'incident_body',
                    details: incident.description
                },
                service: {
                    id: getOppositeServiceId(incident.service.id),
                    type: 'service_reference'
                },
            }
        };
        axiosInstance.post('/incidents', requestIncident)
            .catch(error => {
                console.log(error);
            });
    })

    res.sendStatus(200);
});


module.exports = router;