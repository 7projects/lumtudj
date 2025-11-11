import { create } from 'zustand'

const useAppStore = create((set) => ({
  // --- UI state ---
  menuPosition: null,
  setMenuPosition: (position) => set({ menuPosition: position ? { x: position.x, y: position.y } : null }),

  // --- Library state ---
  library: [],
  setLibrary: (lib) => set({ library: lib }),

  filteredLibrary: [],
  setFilteredLibrary: (lib) => set({ filteredLibrary: lib }),

  loadingLibrary: null,
  setLoadingLibrary: (loading) => set({ loadingLibrary: loading }),

  selectedLibraryIndex: null,
  setSelectedLibraryIndex: (index) => set({ selectedLibraryIndex: index }),

  selectedLibraryItem: null,
  setSelectedLibraryItem: (plst) => set({ selectedLibraryItem: plst }),

  // --- Track selection ---
  selectedTrack: null,
  setSelectedTrack: (track) => set({ selectedTrack: track }),

  selectedTrackIndex: null,
  setSelectedTrackIndex: (index) => set({ selectedTrackIndex: index }),

  selectedPlaylistTrackIndex: -1,
  setSelectedPlaylistTrackIndex: (index) => set({ selectedPlaylistTrackIndex: index }),

  selectedPlaylistChanged: false,
  setSelectedPlaylistChanged: (value) => set({ selectedPlaylistChanged: value }),

  playlistChanged: false,
  setPlaylistChanged: (value) => set({ playlistChanged: value }),

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
