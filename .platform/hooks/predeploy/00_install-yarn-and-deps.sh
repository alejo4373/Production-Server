#!/bin/bash

# This is a platform hook. See
# https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-linux-extend.html

# Pull yarn version to install from engines.yarn in package.json
yarnVersion=$(jq '.engines.yarn' package.json -r)

# Install yarn
npm install yarn@$yarnVersion -g

# Needed bacause yarn is not added automatically to the PATH
env PATH="$PATH:$NODE_HOME/bin"

# install deps
cd /var/app/staging && yarn
