import { NavigationContext } from './navigationContextExports'

export function NavigationProvider({ value, children }) {
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}


