#!/bin/bash
set -e

echo "Deployment started ..."

# Copying src to /var/www/
echo "Copying src to /var/www/bike-kitchen"
sudo cp -r src/* /var/www/bike-kitchen

echo "Deployment Finished!"