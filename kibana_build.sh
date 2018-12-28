#!/bin/sh

pwd
cd kibana
pwd
yarn kbn bootstrap
node scripts/build --skip-os-packages --skip-archives --no-oss --release
cd ../kibana_extra/webitel
pwd
yarn install
yarn kbn run build

exit 0
