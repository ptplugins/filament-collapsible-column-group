# Filament Collapsible Column Group

> Collapsible (expand/collapse) **column groups** for [FilamentPHP](https://filamentphp.com/) tables — **v3, v4, and v5**. Click a group header and the columns it spans fold away into a thin placeholder; click again to bring them back.

Wide tables with logically grouped columns (e.g. *Q1 / Q2 / Q3 / Q4*, or *Address*, *Contact*, *Billing*) get unreadable fast. This package turns any Filament `ColumnGroup` header into a toggle that collapses everything under it, so users can focus on the groups they care about. The collapsed state is remembered and survives sorting, filtering and pagination.

Single codebase across all three Filament major versions — same class, same API.

<p align="center" class="filament-hidden">
  <a href="https://ptplugins.com/buy-us-a-beer"><img src="https://img.shields.io/badge/%F0%9F%8D%BA-Buy%20us%20a%20beer-yellow" alt="Buy us a beer"></a>
</p>

## Installation

```bash
composer require ptplugins/filament-collapsible-column-group
```

The package auto-discovers its service provider and registers its own JS/CSS through `FilamentAsset`. There is nothing to publish.

## Quick start

Swap Filament's `ColumnGroup` for `CollapsibleColumnGroup` and call `->collapsible()`:

```php
use PtPlugins\FilamentCollapsibleColumnGroup\CollapsibleColumnGroup;
use Filament\Tables\Columns\TextColumn;

public function table(Table $table): Table
{
    return $table->columns([
        TextColumn::make('name'),

        CollapsibleColumnGroup::make('Q1')
            ->collapsible()
            ->columns([
                TextColumn::make('jan'),
                TextColumn::make('feb'),
                TextColumn::make('mar'),
            ]),

        CollapsibleColumnGroup::make('Q2')
            ->collapsible(collapsedByDefault: true) // starts folded
            ->columns([
                TextColumn::make('apr'),
                TextColumn::make('may'),
                TextColumn::make('jun'),
            ]),
    ]);
}
```

That's it. Each collapsible group header shows a `−` (expanded) or `+` (collapsed) icon; clicking it folds the columns it spans into a single thin placeholder cell so the row layout stays intact.

## API

| Method | Default | Description |
| --- | --- | --- |
| `collapsible(bool $collapsible = true, bool $collapsedByDefault = false)` | — | Makes the group header a collapse/expand toggle. Pass `collapsedByDefault: true` to render it folded on first load. |

`CollapsibleColumnGroup` **extends Filament's `ColumnGroup`**, so everything you already do with a column group keeps working — `->columns([...])`, `->alignment()`, `->wrapHeader()`, and so on. `collapsible()` is purely additive; a group without it behaves exactly like a normal `ColumnGroup`.

## How it works

The PHP class is a thin annotator. When a group is `collapsible()` it:

- prepends a `+`/`−` icon to the group label, and
- tags the group header `<th>` with `data-collapsible-group` and `data-collapsed-default` via `extraHeaderAttributes()`.

All behaviour lives in the bundled JS:

- A single delegated click handler toggles the group: it shrinks the header's `colspan`, hides the body cells the group spans (keeping the first one as a `2rem` placeholder so columns stay aligned), and flips the icon.
- The collapsed/expanded state is stored per group in `sessionStorage` and re-applied on a Livewire `commit` hook, so it **persists across sorting, filtering, pagination and any other Livewire re-render**.

Because it only touches the public `ColumnGroup` API plus its own `data-*` hooks — never Filament's internal markup or CSS classes — the exact same code runs on Filament v3, v4 and v5 (Livewire 3 and 4).

## Notes & gotchas

- **Group state keys off the label.** Persistence uses a slug of the group label, so give collapsible groups in the same table distinct labels (two groups both labelled "Total" would share one collapsed state).
- **Toggling is pure front-end.** Collapsing never hits the server — it's instant and does not re-query. Only the persisted state is re-applied after Livewire updates.
- **It folds columns, not data.** Collapsed columns are hidden in the DOM, not removed from the query. Exports, summaries and totals are unaffected.

## Requirements

- PHP 8.1+
- Filament 3.x, 4.x, or 5.x

## License

MIT — see [LICENSE.md](LICENSE.md).

---

Part of the [ptplugins.com](https://ptplugins.com) collection of FilamentPHP plugins.
