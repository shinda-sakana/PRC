const FeatureFlags = {
  EventDispatcherDiffStates: false,
  EventDispatcherCalcCostTime: false,
  BaseFoundationSyncStates: false,
};

export function setFlagEventDispatcherDiffStates(flag: boolean) {
  FeatureFlags.EventDispatcherDiffStates = flag;
}

export function setFlagEventDispatcherClacCostTime(flag: boolean) {
  FeatureFlags.EventDispatcherCalcCostTime = flag;
}

export function setFlagBaseFoundationSyncStates(flag: boolean) {
  FeatureFlags.BaseFoundationSyncStates = flag;
}

export default new Proxy(FeatureFlags, {
  get(tar, key) {
    const flag = tar[key];
    return flag;
  },
  set() {
    throw new Error('could not set any flag directly at flags map');
  }
});
