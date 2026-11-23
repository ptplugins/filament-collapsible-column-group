// Collapsible column groups for Filament tables.
//
// Headers rendered with `data-collapsible-group` (see CollapsibleColumnGroup PHP class)
// collapse/expand the columns they span. The collapsed state of each group is kept per
// group slug in sessionStorage and is the only source of truth.
//
// Every render is idempotent: the table is first restored to the server-rendered
// layout (everything this script changed is undone), then the stored state is applied
// again. Nothing is toggled, so a Livewire update of another component, a partial
// morph or a repeated call can never leave the column positions out of sync.
// Collapsed cells are styled inline, without a stylesheet; a collapsed group header
// gets a `data-cg-collapsed` attribute so apps can style it.
(function () {
    'use strict';

    var GROUP_SELECTOR = '[data-collapsible-group]';
    var STORAGE_PREFIX = 'cg-';

    var PLACEHOLDER_STYLE = {
        'width': '2rem',
        'min-width': '2rem',
        'max-width': '2rem',
        'padding': '0.25rem',
        'overflow': 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
    };

    function readState(slug) {
        try {
            return sessionStorage.getItem(STORAGE_PREFIX + slug);
        } catch (e) {
            return null;
        }
    }

    function writeState(slug, collapsed) {
        try {
            sessionStorage.setItem(STORAGE_PREFIX + slug, collapsed ? '1' : '0');
        } catch (e) {
            // Storage unavailable (private mode): the state lives only until the next render.
        }
    }

    function isCollapsed(th) {
        var saved = readState(th.dataset.collapsibleGroup);

        if (saved === '1') return true;
        if (saved === '0') return false;

        return th.dataset.collapsedDefault === 'true';
    }

    // Remember the server-rendered inline style once, before the first change.
    function touch(cell) {
        if (cell.dataset.cgTouched === undefined) {
            cell.dataset.cgTouched = cell.getAttribute('style') || '';
        }
    }

    function restoreCell(cell) {
        var original = cell.dataset.cgTouched;

        if (original === '') {
            cell.removeAttribute('style');
        } else {
            cell.setAttribute('style', original);
        }

        delete cell.dataset.cgTouched;
    }

    // Undo everything applyTable() did, so the table matches the server-rendered DOM.
    function resetTable(table) {
        Array.prototype.forEach.call(table.rows, function (row) {
            Array.prototype.forEach.call(row.cells, function (cell) {
                delete cell.dataset.cgCollapsed;

                if (cell.dataset.cgColspan !== undefined) {
                    cell.colSpan = parseInt(cell.dataset.cgColspan, 10) || 1;
                    delete cell.dataset.cgColspan;
                }

                if (cell.dataset.cgTouched !== undefined) {
                    restoreCell(cell);
                }
            });
        });
    }

    function setIcon(th, collapsed) {
        var icon = th.querySelector('.col-group-icon');

        if (icon) icon.textContent = collapsed ? '+' : '−';
    }

    function applyTable(table) {
        resetTable(table);

        var groupRow = null;
        var ranges = [];

        Array.prototype.forEach.call(table.rows, function (row) {
            var position = 0;

            Array.prototype.forEach.call(row.cells, function (cell) {
                var span = cell.colSpan || 1;

                if (cell.matches(GROUP_SELECTOR)) {
                    groupRow = row;

                    var collapsed = isCollapsed(cell);
                    setIcon(cell, collapsed);

                    // Styling hook for collapsed group headers (e.g. wrap a long label).
                    if (collapsed) cell.dataset.cgCollapsed = '';

                    if (collapsed && span > 1) {
                        ranges.push({ start: position, end: position + span });
                        cell.dataset.cgColspan = String(span);
                        cell.colSpan = 1;
                    }
                }

                position += span;
            });
        });

        if (!groupRow || !ranges.length) return;

        Array.prototype.forEach.call(table.rows, function (row) {
            if (row === groupRow) return;

            var position = 0;

            Array.prototype.forEach.call(row.cells, function (cell) {
                var span = cell.colSpan || 1;
                var index = position;
                position += span;

                // Cells spanning several columns (empty state, summaries) are left alone.
                if (span !== 1) return;

                for (var r = 0; r < ranges.length; r++) {
                    if (index < ranges[r].start || index >= ranges[r].end) continue;

                    touch(cell);

                    if (index === ranges[r].start) {
                        Object.keys(PLACEHOLDER_STYLE).forEach(function (key) {
                            cell.style.setProperty(key, PLACEHOLDER_STYLE[key], 'important');
                        });
                    } else {
                        cell.style.setProperty('display', 'none', 'important');
                    }

                    return;
                }
            });
        });
    }

    function applyAll() {
        var tables = [];

        document.querySelectorAll(GROUP_SELECTOR).forEach(function (th) {
            var table = th.closest('table');

            if (table && tables.indexOf(table) === -1) tables.push(table);
        });

        tables.forEach(applyTable);
    }

    function onGroupHeaderClick(e) {
        var th = e.target.closest(GROUP_SELECTOR);
        if (!th) return;

        var table = th.closest('table');
        if (!table) return;

        writeState(th.dataset.collapsibleGroup, !isCollapsed(th));
        applyTable(table);
    }

    // "+/−" toolbar button: collapse every group of the table when at least one is
    // expanded, otherwise expand them all.
    function toggleAll(button) {
        var container = button.closest('.fi-ta') || document;
        var groups = container.querySelectorAll(GROUP_SELECTOR);
        if (!groups.length) return;

        var collapse = Array.prototype.some.call(groups, function (th) {
            return !isCollapsed(th);
        });

        var tables = [];

        groups.forEach(function (th) {
            writeState(th.dataset.collapsibleGroup, collapse);

            var table = th.closest('table');
            if (table && tables.indexOf(table) === -1) tables.push(table);
        });

        tables.forEach(applyTable);
    }

    window.CollapsibleColumnGroup = { toggleAll: toggleAll, applyAll: applyAll };

    function scheduleApplyAll() {
        requestAnimationFrame(applyAll);
    }

    function init() {
        document.addEventListener('click', onGroupHeaderClick);
        document.addEventListener('livewire:navigated', scheduleApplyAll);

        applyAll();

        var hook = function () {
            Livewire.hook('commit', function (payload) {
                payload.succeed(scheduleApplyAll);
            });
        };

        if (window.Livewire) {
            hook();
        } else {
            document.addEventListener('livewire:init', hook);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
