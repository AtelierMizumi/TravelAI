package com.travelai.backend.admin;

import com.travelai.backend.security.SessionService;
import org.springframework.stereotype.Component;

/**
 * Maintenance gate policy. NEW_PURCHASE (canonical review creation AND
 * first pay of a review, both of which create a new confirmed booking)
 * is blocked; everything else (auth, read, cancel/refund, admin) stays
 * available so money-related flows can complete.
 */
@Component
public class MaintenancePolicy {

    public enum MaintenanceAction {
        READ,
        AUTH,
        NEW_PURCHASE,
        PAY_EXISTING,
        CANCEL_REFUND,
        ADMIN
    }

    public boolean shouldBlock(boolean maintenanceEnabled, SessionService.Actor actor, MaintenanceAction action) {
        if (actor != null && actor.admin()) {
            return false;
        }
        if (action != MaintenanceAction.NEW_PURCHASE) {
            return false;
        }
        return maintenanceEnabled;
    }
}
