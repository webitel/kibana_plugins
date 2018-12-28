
export class JobManager {
    constructor(httpAgent, chrome) {
        this.httpAgent = httpAgent;
        this.baseUrl = chrome.addBasePath(`/api/reporting/v1/jobs`);
    }

    async create(attribute) {
        attribute.name = attribute.id;
        delete attribute.id;
        return await this.httpAgent
            .post(`${this.baseUrl}`, attribute)
            .then(response => transformRecord(response.data))
    }

    async update(jobId, attribute) {

    }

    async getJob(id) {
        return await this.httpAgent
            .get(`${this.baseUrl}/${id}`)
            .then(response => transformRecord(response.data));
    }

    async getJobs() {
        return await this.httpAgent
            .get(`${this.baseUrl}`)
            .then(response => transform(response.data));
    }

    async updateVisualizations(jobId, vis) {
        return await this.httpAgent
            .put(`${this.baseUrl}/${jobId}`, {vis})
            .then(response => transformRecord(response.data))
    }

    async remove(jobId) {
        return await this.httpAgent
            .delete(`${this.baseUrl}/${jobId}`)
            .then(response => transformRecord(response.data))
    }
}

function transform(data) {
    return data.hits.hits.map(transformRecord)
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