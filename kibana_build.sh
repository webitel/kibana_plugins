#!/bin/sh

cd kibana
cd packages/kbn-plugin-helpers
yarn link
cd ../..
yarn kbn bootstrap
node scripts/build --skip-os-packages --skip-archives --no-oss --release


cd ../kibana_extra/webitel
yarn install

cd ..
cp -r webitel ../kibana/build/default/kibana-6.5.4-linux-x86_64/plugins/

exit 0
