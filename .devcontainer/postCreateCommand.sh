#!/usr/bin/env bash

set -euo pipefail

pnpm config set store-dir ~/.local/share/pnpm/store
npm uninstall -g pnpm
sudo corepack enable pnpm
