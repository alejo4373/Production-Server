#!/bin/bash

curl https://get.volta.sh | bash

# Install node
# EB installs node version specified in "engines" in package.json
# volta install node@16.14.0

# Install yarn
volta install yarn@1.22.10

# install deps
cd /var/app/staging && yarn
