
export class EmailConfigurationManager {
    constructor(httpAgent, chrome) {
        this.httpAgent = httpAgent;
        this.baseUrl = chrome.addBasePath(`/api/reporting/v1/email`);
    }

    async getEmailConfiguration() {
        return await this.httpAgent
            .get(`${this.baseUrl}`)
            .then(response => {
                if (response.data.status === 404) {
                    return {}
                }
                return transformRecord(response.data);
            });
    }

    async saveEmailConfiguration(attribute = {}) {
        return await this.httpAgent
            .post(`${this.baseUrl}`, attribute)
            .then(response => transformRecord(response.data));
    }
}

function transformRecord(item) {
    return {
        id: item._id,
        ...transformSource(item)
    }
}

function transformSource(item) {
    return item._source
}