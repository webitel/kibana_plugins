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

git clone https://github.com/fbaligand/kibana-enhanced-table.git
cd kibana-enhanced-table
yarn install
cd ..
cp -r kibana-enhanced-table ../kibana/build/default/kibana-6.5.4-linux-x86_64/plugins/

git clone https://github.com/datasweet/kibana-datasweet-formula.git
cd kibana-datasweet-formula
yarn install
cd ..
cp -r kibana-datasweet-formula ../kibana/build/default/kibana-6.5.4-linux-x86_64/plugins/

exit 0
