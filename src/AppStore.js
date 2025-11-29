import { create } from 'zustand'

const useAppStore = create((set) => ({
  // --- UI state ---
  menuPosition: null,
  setMenuPosition: (position) => set({ menuPosition: position ? { x: position.x, y: position.y } : null }),

  menuAnchor: null,
  setMenuAnchor: (anchor) => set({ menuAnchor: anchor }),

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

  playlistIndex: -1,
  setPlaylistIndex: (index) => set({ playlistIndex: index }),

  selectedPlaylistChanged: false,
  setSelectedPlaylistChanged: (value) => set({ selectedPlaylistChanged: value }),

  playlistChanged: false,
  setPlaylistChanged: (value) => set({ playlistChanged: value }),

  selectedArtist: null,
  setSelectedArtist: (info) => set({ selectedArtist: info }),

  loadingArtistInfo: false,
  setLoadingArtistInfo: (loading) => set({ loadingArtistInfo: loading }),
  
  playedFrom: null,
  setPlayedFrom: (source) => set({ playedFrom: source }),
  // --- Drag & drop state ---

  artistInfoPosition: { x: 100, y: 100 },
  setArtistInfoPosition: (position) => set({ artistInfoPosition: position }),

  dragTrack: null,
  setDragTrack: (track) => set({ dragTrack: track }),

  dragSource: null,
  setDragSource: (source) => set({ dragSource: source }),

  dragSourceIndex: null,
  setDragSourceIndex: (index) => set({ dragSourceIndex: index }),

  // --- UI lock state ---
  locked: false,
  setLocked: (value) => set({ locked: value }),



}))

export default useAppStore
