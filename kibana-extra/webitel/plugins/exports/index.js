/**
 * Created by igor on 07.11.16.
 */

"use strict";
import { resolve } from 'path';

import proxySearchScroll from './lib/init_proxy_search_scroll'

export const exports = (kibana) => {
    return new kibana.Plugin({
        id: 'exports',
        require: ['webitel_main', 'recordings'],
        configPrefix: 'webitel.exports',
        publicDir: resolve(__dirname, 'public'),
        uiExports: {
            shareContextMenuExtensions: [
                'plugins/exports/share_context_menu/register_export'
            ]
        },
        config(Joi) {
            return Joi.object({
                enabled: Joi.boolean().default(true)
            }).default()
        },
        init (server) {
            proxySearchScroll(server)
        }
    })
}