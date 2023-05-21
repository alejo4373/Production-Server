#!/bin/bash

# This is a platform hook. See
# https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-linux-extend.html

# Pull yarn version to install from engines.yarn in package.json
yarnVersion=$(jq '.engines.yarn' package.json -r)

# Install yarn
npm install yarn@$yarnVersion -g

# install deps
cd /var/app/staging && yarn
