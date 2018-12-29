import  { createProxy }  from '../../../../../kibana/src/core_plugins/elasticsearch/lib/create_proxy'

export default (server) => {
    createProxy(server, 'POST', '/_search/scroll')
}