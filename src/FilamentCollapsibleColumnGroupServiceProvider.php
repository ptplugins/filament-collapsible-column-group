<?php

namespace PtPlugins\FilamentCollapsibleColumnGroup;

use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentCollapsibleColumnGroupServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-collapsible-column-group';

    public function configurePackage(Package $package): void
    {
        $package->name(static::$name);
    }

    public function packageRegistered(): void
    {
        FilamentAsset::register([
            Js::make('collapsible-column-group', __DIR__.'/../dist/collapsible-column-group.js'),
            Css::make('collapsible-column-group', __DIR__.'/../dist/collapsible-column-group.css'),
        ], 'ptplugins/filament-collapsible-column-group');
    }
}
