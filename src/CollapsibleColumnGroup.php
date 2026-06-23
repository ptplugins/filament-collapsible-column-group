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

    protected function getGroupSlug(): string
    {
        $label = parent::getLabel();
        $labelStr = $label instanceof Htmlable ? strip_tags($label->toHtml()) : $label;

        return Str::slug($labelStr);
    }
}
