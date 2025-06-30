// themeStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define your themes here or import from a separate file
const defaultTheme = {
    trackRow: {
        background: '#282828',
        color: "white",
        borderBottom: "1px solid #404040"
    }
}

const blueTheme = {
    trackRow: {
        background: 'blue',
        color: "white",
        borderBottom: "1px solid white"
    }
}

// Zustand store
const useThemeStore = create(
  persist(
    (set) => ({
      currentTheme: defaultTheme,
      setTheme: (theme) => set({ currentTheme: theme }),
    }),
    {
      name: 'theme-store', // localStorage key
    }
  )
)

export { defaultTheme, blueTheme }
export default useThemeStore
