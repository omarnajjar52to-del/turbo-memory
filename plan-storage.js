export function applyPlanRevision(state, defaultPlan, revision) {
  if (state.planRevision === revision) return false;
  if (state.plan) {
    state.planArchive ||= {};
    state.planArchive[state.planRevision || 'upper-lower-v1'] = structuredClone(state.plan);
  }
  if (state.planRevision === 'muscle-pairs-v2' && revision === 'arms-focus-v3' && state.plan?.length === 7) {
    state.plan[5] = structuredClone(defaultPlan[5]);
  } else {
    state.plan = structuredClone(defaultPlan);
  }
  state.planRevision = revision;
  return true;
}
