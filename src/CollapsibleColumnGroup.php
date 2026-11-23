<?php

namespace PtPlugins\FilamentCollapsibleColumnGroup;

use Filament\Tables\Columns\ColumnGroup;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;

/**
 * A Filament table ColumnGroup whose header can collapse/expand the columns it spans.
 *
 * The PHP side only annotates the group header with `data-collapsible-group` /
 * `data-collapsed-default` attributes and prepends a +/- icon. All toggling, layout
 * and persistence is handled by the bundled JS asset registered via FilamentAsset.
 */
class CollapsibleColumnGroup extends ColumnGroup
{
    protected bool $isCollapsible = false;

    protected bool $isCollapsedByDefault = false;

    public function collapsible(bool $collapsible = true, bool $collapsedByDefault = false): static
    {
        $this->isCollapsible = $collapsible;
        $this->isCollapsedByDefault = $collapsedByDefault;

        if ($collapsible) {
            $this->extraHeaderAttributes(fn (): array => [
                'data-collapsible-group' => $this->getGroupSlug(),
                'data-collapsed-default' => $this->isCollapsedByDefault ? 'true' : 'false',
                'style' => 'cursor: pointer; user-select: none;',
            ], merge: true);
        }

        return $this;
    }

    public function isCollapsible(): bool
    {
        return $this->isCollapsible;
    }

    public function isCollapsedByDefault(): bool
    {
        return $this->isCollapsedByDefault;
    }

    public function getLabel(): string|Htmlable
    {
        $label = parent::getLabel();

        if (! $this->isCollapsible) {
            return $label;
        }

        $icon = $this->isCollapsedByDefault ? '+' : '−';
        $labelStr = $label instanceof Htmlable ? $label->toHtml() : e($label);

        return new HtmlString(
            '<span class="col-group-icon mr-1 font-mono select-none">'.$icon.'</span>'.$labelStr
        );
    }

    /**
     * A "+/−" button that collapses all collapsible groups of the table it is rendered in
     * (or expands them all when every group is already collapsed). Meant for a table
     * toolbar render hook, e.g. TablesRenderHook::TOOLBAR_SEARCH_AFTER next to the filters.
     */
    public static function toggleAllButton(string $tooltip = 'Collapse / expand all column groups'): Htmlable
    {
        return new HtmlString(
            '<button type="button" data-collapsible-toggle-all'
            .' title="'.e($tooltip).'" aria-label="'.e($tooltip).'"'
            .' x-on:click="window.CollapsibleColumnGroup?.toggleAll($el)"'
            .' class="fi-icon-btn flex h-9 items-center justify-center rounded-lg px-2 font-mono text-lg font-semibold text-gray-400 outline-none transition duration-75 hover:text-gray-500 focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-gray-500 dark:hover:text-gray-400">'
            .'+/−</button>'
        );
    }

    protected function getGroupSlug(): string
    {
        $label = parent::getLabel();
        $labelStr = $label instanceof Htmlable ? strip_tags($label->toHtml()) : $label;

        return Str::slug($labelStr);
    }
}
