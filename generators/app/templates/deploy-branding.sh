#!/bin/bash

# Stop on any failure
set -e

# Detect build system (brunch or newest vite)
HAS_BRUNCH=$(grep -q '"brunch"' package.json && echo true || echo false)

if $HAS_BRUNCH; then
  echo ">>>>> yarn install"
  yarn install
else
  echo ">>>>> npm install"
  npm install
fi

echo ">>>>> Updating git submodules"
git submodule update --init --recursive

# Build project
if $HAS_BRUNCH; then
  echo ">>>>> Building the branding with Brunch for production"
  brunch build --production
else
  echo ">>>>> Building the branding with Vite for production"
  npm run build
fi

echo ">>>>> Creating remote directory if needed"

ssh <%= LA_branding_hostname %> sudo mkdir -p /srv/<%= LA_branding_url %>/www/<%= LA_branding_path %>

echo ">>>>> Rsync the builded branding"

# Determine source directory based on build system
SOURCE_DIR=$($HAS_BRUNCH && echo "public" || echo "dist")

echo ">>>>> Rsync $SOURCE_DIR to remote server"
rsync -a --delete --rsync-path="sudo rsync" --info=progress2 $SOURCE_DIR/ <%= LA_branding_hostname %>:/srv/<%= LA_branding_url %>/www/<%= LA_branding_path %>

# Renabling stop on error as maybe some of this urls are not up
set +e
echo ">>>>> Clearing the LA modules header/footer caches:"
for url in $(grep "url:" app/js/settings.js  | sed "s/.*url: '//g" | awk -F "'" '{print $1}' | egrep -Ev "^$|twitter|your-area|datasets")
do
    echo "--- Clearing $url/headerFooter/clearCache"
    curl -s --output /dev/null  $url/headerFooter/clearCache 2>&1 || true
done
