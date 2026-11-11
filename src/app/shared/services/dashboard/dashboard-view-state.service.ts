/** Angular Imports */
import { Injectable, signal } from '@angular/core';

/** Third Party Imports */
import { Subject } from 'rxjs';

/** Local Imports */
import type { DashboardJumpTarget } from '@shared/models/dashboard/dashboard-jump-target.type';

/**
 * What the top bar's totals need to know about the Dashboard page, and how they talk to
 * it: whether it's open, whether its stat tiles are on screen, and jump requests.
 */
@Injectable({ providedIn: 'root' })
export class DashboardViewStateService {
    /**
     * True while the Dashboard's own stat tiles are on screen - the top bar's totals hide
     * then (it appears once they scroll away)
     * @type {WritableSignal<boolean>}
     */
    public readonly tilesInView = signal(false);

    /**
     * True while the Dashboard page is open - the top bar's totals then jump to the
     * page's breakdowns when clicked
     * @type {WritableSignal<boolean>}
     */
    public readonly dashboardActive = signal(false);

    /**
     * Jumps requested from the top bar's totals, handled by the Dashboard (scrolls to
     * that breakdown)
     * @type {Subject<DashboardJumpTarget>}
     */
    public readonly jumpRequests = new Subject<DashboardJumpTarget>();
}
