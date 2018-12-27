#!/bin/sh

cd kibana
yarn kbn bootstrap
node scripts/build --skip-os-packages --skip-archives --no-oss --release

exit 0
