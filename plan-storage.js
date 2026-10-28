export function applyPlanRevision(state, defaultPlan, revision) {
  if (state.planRevision === revision) return false;
  if (state.plan) {
    state.planArchive ||= {};
    state.planArchive[state.planRevision || 'upper-lower-v1'] = structuredClone(state.plan);
  }
  state.plan = structuredClone(defaultPlan);
  state.planRevision = revision;
  return true;
}
