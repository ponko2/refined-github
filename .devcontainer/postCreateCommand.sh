#!/usr/bin/env bash

set -euo pipefail

git config --global --add safe.directory /workspaces/refined-github

npm uninstall -g pnpm
sudo corepack enable pnpm
corepack install --global pnpm
pnpm config set store-dir ~/.local/share/pnpm/store

pnpm install --force
