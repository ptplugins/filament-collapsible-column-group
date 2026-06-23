# Changelog

All notable changes to `ptplugins/filament-collapsible-column-group` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-06-23

### Added
- Listing banner (`screenshot.png`, 2560×1440) for the filamentphp.com/plugins submission, plus a README hero image carrying `filament-hidden` so it shows on GitHub/Packagist but not on the Filament listing (where the banner already appears).

## [1.0.0] - 2026-06-22

### Added
- Initial public release under `ptplugins/filament-collapsible-column-group` (MIT).
- `CollapsibleColumnGroup` — a drop-in replacement for Filament's `ColumnGroup` whose header collapses and expands the columns it spans. Clicking the group header folds those columns into a thin placeholder (the first column stays as a stub); clicking again restores them.
- `->collapsible(bool $collapsible = true, bool $collapsedByDefault = false)` opt-in API. The PHP layer only annotates the group header (`data-collapsible-group`, `data-collapsed-default`) and prepends a `+`/`−` icon; all toggling, layout and persistence live in the bundled JS asset.
- Collapsed state is persisted per group (in `sessionStorage`) and re-applied after every Livewire commit, so it survives sorting, filtering and pagination.
- Single codebase across Filament **v3, v4, and v5** (`^3.0 || ^4.0 || ^5.0`). The package depends only on the public `ColumnGroup` / `extraHeaderAttributes()` API and its own `data-*` hooks — never on Filament's internal markup or class names — so the same code runs unchanged on all three majors (verified against Filament v4 and v5, Livewire 3 and 4).
