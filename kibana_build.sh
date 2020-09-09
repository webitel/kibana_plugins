#!/bin/sh

cd kibana
cd packages/kbn-plugin-helpers
yarn link
cd ../..
yarn kbn bootstrap
node scripts/build --skip-os-packages --skip-archives --no-oss --release


cd ../kibana-extra/webitel
yarn kbn bootstrap

cd ..
cp -r webitel ../kibana/build/default/kibana-6.5.4-linux-x86_64/plugins/

git clone --branch v1.0.0 https://github.com/fbaligand/kibana-enhanced-table.git
cd kibana-enhanced-table
yarn install
cd ..
mv kibana-enhanced-table ../kibana/build/default/kibana-6.5.4-linux-x86_64/plugins/enhanced-table

cd datasweet-formula
yarn install
cd ..
mv datasweet-formula ../kibana/build/default/kibana-6.5.4-linux-x86_64/plugins/datasweet-formula

cd kibana-time-plugin
bower install
cd ..
mv kibana-time-plugin ../kibana/build/default/kibana-6.5.4-linux-x86_64/plugins/kibana-time-plugin

exit 0
