import { create } from 'zustand'

const useAppStore = create((set) => ({
  // --- UI state ---
  menuPosition: null,
  setMenuPosition: (position) => set({ menuPosition: position ? { x: position.x, y: position.y } : null }),

  // --- Library state ---
  library: [],
  setLibrary: (lib) => set({ library: lib }),

  loadingLibrary: null,
  setLoadingLibrary: (loading) => set({ loadingLibrary: loading }),

  selectedLibraryIndex: null,
  setSelectedLibraryIndex: (index) => set({ selectedLibraryIndex: index }),

  // --- Track selection ---
  selectedTrack: null,
  setSelectedTrack: (track) => set({ selectedTrack: track }),

  selectedTrackIndex: null,
  setSelectedTrackIndex: (index) => set({ selectedTrackIndex: index }),

  selectedPlaylistTrackIndex: -1,
  setSelectedPlaylistTrackIndex: (index) => set({ selectedPlaylistTrackIndex: index }),

  // --- Background playlists ---
  backgroundPlaylists: [],
  setBackgroundPlaylists: (plsts) => set({ backgroundPlaylists: plsts }),

  // --- Drag & drop state ---
  dragTrack: null,
  setDragTrack: (track) => set({ dragTrack: track }),

  dragSource: null,
  setDragSource: (source) => set({ dragSource: source }),

  dragTrackIndex: null,
  setDragTrackIndex: (index) => set({ dragTrackIndex: index }),

  // --- UI lock state ---
  locked: false,
  setLocked: (value) => set({ locked: value }),

}))

export default useAppStore
