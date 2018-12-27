#!/bin/sh

git clone https://github.com/elastic/kibana.git
cp disable_enterprise_plugins.patch kibana/
cd kibana && \
    git checkout v6.5.4 && \
    git apply disable_enterprise_plugins.patch

exit 0
