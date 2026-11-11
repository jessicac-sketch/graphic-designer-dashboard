/** Angular Imports */
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    input,
    viewChild,
} from '@angular/core';

/** Third Party Imports */
import {
    namespaceSvgIds,
    NTV360_LOGO_SVG,
    parseLogoSvg,
    sanitizeLogoSvg,
} from '@ntv360/component-pantry';

/** Local Imports */
import { BrandSize } from '@shared/models/brand';

/** Running counter so every logo instance gets unique SVG ids. */
let brandInstanceCount = 0;

/**
 * NTV360 wordmark with an optional product caption.
 *
 * @remarks
 * Renders the official logo from component-pantry. Each instance namespaces the SVG's
 * gradient ids, so several logos on one page (e.g. sidebar + mobile drawer) never clash.
 *
 * @example
 * <app-brand caption="GBP Management Tool" />
 * <app-brand size="lg" caption="GBP Management Tool" />
 */
@Component({
    selector: 'app-brand',
    templateUrl: './brand.component.html',
    styleUrl: './brand.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class BrandComponent {
    /**
     * Product name shown under the logo; omit for the logo only
     * @type {InputSignal<string | null>}
     */
    public readonly caption = input<string | null>(null);

    /**
     * Logo size: compact for app chrome, large for standalone pages
     * @type {InputSignal<BrandSize>}
     */
    public readonly size = input<BrandSize>('md');

    /**
     * Element the logo SVG is inserted into
     * @type {Signal<ElementRef<HTMLElement>>}
     */
    private readonly logoHost = viewChild.required<ElementRef<HTMLElement>>('logo');

    constructor() {
        afterNextRender(() => this.renderLogo());
    }

    /**
     * Parses, sanitizes and namespaces the logo SVG, then inserts it.
     *
     * @returns {void}
     */
    private renderLogo(): void {
        const svg = parseLogoSvg(NTV360_LOGO_SVG);
        if (!svg) {
            return;
        }

        sanitizeLogoSvg(svg);
        namespaceSvgIds(svg, `app-brand-${++brandInstanceCount}`);
        // Inserted at runtime, so scoped component styles cannot reach it: size it inline
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.height = '100%';
        svg.style.width = 'auto';
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'NTV360');

        this.logoHost().nativeElement.replaceChildren(svg);
    }
}
