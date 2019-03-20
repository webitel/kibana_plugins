import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules';

import {HIDDEN_CONFIG_ID} from '../../lib/config'

uiModules.get('webitel_main/hacks').run(function ($injector) {
    const config = $injector.get('config');
    let hiddenLinks = config.get(HIDDEN_CONFIG_ID, {});

    try {
        hiddenLinks = JSON.parse(hiddenLinks)
    } catch (e) {

    }

    if (Object.keys(hiddenLinks) < 1) {
        return
    }

    const http = $injector.get('$http');
    http.get(chrome.getBasePath() + '/api/webitel/v1/whoami')
        .then(
            res=> {
                const {credentials} = res.data;
                if (hiddenLinks.hasOwnProperty(credentials.role)) {
                    const hideIds = hiddenLinks[credentials.role].map(i => i.id);
                    chrome.getNavLinks().forEach((navLink) => {
                        if (~hideIds.indexOf(navLink.id)) {
                            navLink.hidden = true;
                        }
                    })
                }
            },
            err => {
                //TODO don't execute if login page
            }
        )
});