#!/bin/sh

set -eu

action="${1:-Check}"
script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd)
project_root=$(CDPATH= cd "$script_dir/.." && pwd)

cd "$project_root"

assert_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Cannot find $1. Install it first, then reopen Terminal or Codex." >&2
    exit 1
  fi
}

ensure_dependencies() {
  if [ ! -f "$project_root/node_modules/.bin/astro" ]; then
    echo "Dependencies are missing. Running pnpm install..."
    pnpm install --frozen-lockfile --prefer-offline
  fi
}

assert_command git

case "$action" in
  Setup|Check|Dev|Preview)
    assert_command node
    assert_command pnpm
    ;;
  Status|Sync)
    ;;
  *)
    echo "Unknown action: $action" >&2
    echo "Available actions: Setup, Status, Sync, Check, Dev, Preview" >&2
    exit 1
    ;;
esac

echo "Project: $project_root"
echo "Action: $action"

case "$action" in
  Setup)
    echo "Node: $(node --version)"
    echo "pnpm: $(pnpm --version)"
    pnpm install --frozen-lockfile --prefer-offline
    pnpm build
    ;;

  Status)
    git status --short --branch
    git remote -v
    ;;

  Sync)
    changes=$(git status --porcelain)
    if [ -n "$changes" ]; then
      echo "The working tree has uncommitted changes. Sync stopped to protect your work." >&2
      exit 1
    fi

    git switch main
    git pull --ff-only origin main
    ;;

  Check)
    ensure_dependencies
    pnpm build
    ;;

  Dev)
    ensure_dependencies
    pnpm dev
    ;;

  Preview)
    ensure_dependencies
    if [ ! -d "$project_root/dist" ]; then
      pnpm build
    fi
    pnpm preview
    ;;
esac
