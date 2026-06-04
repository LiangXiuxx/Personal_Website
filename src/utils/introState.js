let listeners = []
let phase = 'boot'

export function getIntroPhase() {
  return phase
}

export function setIntroPhase(p) {
  phase = p
  listeners.forEach(fn => fn(p))
}

export function onIntroPhaseChange(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter(l => l !== fn)
  }
}
