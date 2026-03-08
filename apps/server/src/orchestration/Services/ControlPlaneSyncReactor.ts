/**
 * ControlPlaneSyncReactor - Control-plane synchronization reactor interface.
 *
 * Owns background workers that mirror orchestration domain events to an
 * optional external control plane (for example, Convex) while keeping the
 * local runtime authoritative.
 *
 * @module ControlPlaneSyncReactor
 */
import { ServiceMap } from "effect";
import type { Effect, Scope } from "effect";

/**
 * ControlPlaneSyncReactorShape - Service API for control-plane synchronization.
 */
export interface ControlPlaneSyncReactorShape {
  /**
   * Start control-plane synchronization workers.
   *
   * This effect is scoped so all worker fibers are finalized on shutdown.
   */
  readonly start: Effect.Effect<void, never, Scope.Scope>;
}

/**
 * ControlPlaneSyncReactor - Service tag for control-plane sync workers.
 */
export class ControlPlaneSyncReactor extends ServiceMap.Service<
  ControlPlaneSyncReactor,
  ControlPlaneSyncReactorShape
>()("t3/orchestration/Services/ControlPlaneSyncReactor") {}

