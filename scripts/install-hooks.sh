#!/usr/bin/env sh

set -e

HOOKS_DIR=".git/hooks"
SOURCE_DIR="scripts/git-hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "No .git/hooks directory found."
  exit 1
fi

cp "$SOURCE_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "Installed pre-commit hook."
