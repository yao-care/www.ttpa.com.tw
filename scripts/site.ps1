[CmdletBinding()]
param(
    [ValidateSet('Setup', 'Status', 'Sync', 'Check', 'Dev', 'Preview')]
    [string]$Action = 'Check'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

function Add-ToolPath {
    param([string]$Path)

    if ((Test-Path -LiteralPath $Path) -and (($env:Path -split ';') -notcontains $Path)) {
        $env:Path = "$Path;$env:Path"
    }
}

function Invoke-Checked {
    param(
        [string]$Command,
        [string[]]$Arguments
    )

    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed (exit $LASTEXITCODE): $Command $($Arguments -join ' ')"
    }
}

function Assert-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Cannot find $Name. Open this project in Codex desktop or install the required tool."
    }
}

function Ensure-Dependencies {
    $astroCommand = Join-Path $projectRoot 'node_modules\.bin\astro.cmd'
    if (-not (Test-Path -LiteralPath $astroCommand)) {
        Write-Host 'Dependencies are missing. Running pnpm install...'
        Invoke-Checked 'pnpm' @('install', '--frozen-lockfile', '--prefer-offline')
    }
}

$codexDependencies = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies'
Add-ToolPath (Join-Path $codexDependencies 'native\git\cmd')
Add-ToolPath (Join-Path $codexDependencies 'native\git\mingw64\bin')
Add-ToolPath (Join-Path $codexDependencies 'node\bin')
Add-ToolPath (Join-Path $codexDependencies 'bin\override')
Add-ToolPath (Join-Path $codexDependencies 'bin\fallback')

Assert-Command 'git'
Assert-Command 'node'
Assert-Command 'pnpm'

Write-Host "Project: $projectRoot"
Write-Host "Action: $Action"

switch ($Action) {
    'Setup' {
        Write-Host "Node: $(node --version)"
        Write-Host "pnpm: $(pnpm --version)"
        Invoke-Checked 'pnpm' @('install', '--frozen-lockfile', '--prefer-offline')
        Invoke-Checked 'pnpm' @('build')
    }

    'Status' {
        Invoke-Checked 'git' @('status', '--short', '--branch')
        Invoke-Checked 'git' @('remote', '-v')
    }

    'Sync' {
        $changes = & git status --porcelain
        if ($LASTEXITCODE -ne 0) {
            throw 'Unable to read Git status.'
        }
        if ($changes) {
            throw 'The working tree has uncommitted changes. Sync stopped to protect your work.'
        }

        Invoke-Checked 'git' @('switch', 'main')
        Invoke-Checked 'git' @('pull', '--ff-only', 'origin', 'main')
    }

    'Check' {
        Ensure-Dependencies
        Invoke-Checked 'pnpm' @('build')
    }

    'Dev' {
        Ensure-Dependencies
        Invoke-Checked 'pnpm' @('dev')
    }

    'Preview' {
        Ensure-Dependencies
        $distPath = Join-Path $projectRoot 'dist'
        if (-not (Test-Path -LiteralPath $distPath)) {
            Invoke-Checked 'pnpm' @('build')
        }
        Invoke-Checked 'pnpm' @('preview')
    }
}
