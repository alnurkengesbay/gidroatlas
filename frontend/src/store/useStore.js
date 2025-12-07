import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Objects data
      objects: [],
      selectedObject: null,
      filteredObjects: [],
      
      // Filters
      filters: {
        region: '',
        resource_type: '',
        water_type: '',
        fauna: '',
        condition_min: 1,
        condition_max: 5,
        priority_level: '',
        search: ''
      },
      
      // UI state
      showFilters: true,
      showPriorityTable: false,
      showAssistant: false,
      showRoute: false,
      mapCenter: [48.0, 68.0], // Kazakhstan center
      mapZoom: 5,
      
      // Route data
      inspectionRoute: [],
      
      // Actions
      setUser: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: !!token 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        // Закрываем все экспертные окна при выходе
        showPriorityTable: false,
        showAssistant: false,
        showRoute: false,
        inspectionRoute: [],
        selectedObject: null
      }),
      
      setObjects: (objects) => set({ 
        objects, 
        filteredObjects: objects 
      }),
      
      setSelectedObject: (obj) => set({ selectedObject: obj }),
      
      setFilters: (newFilters) => {
        const filters = { ...get().filters, ...newFilters };
        set({ filters });
        
        // Apply filters locally
        const objects = get().objects;
        let filtered = [...objects];
        
        if (filters.region) {
          filtered = filtered.filter(o => o.region === filters.region);
        }
        if (filters.resource_type) {
          filtered = filtered.filter(o => o.resource_type === filters.resource_type);
        }
        if (filters.water_type) {
          filtered = filtered.filter(o => o.water_type === filters.water_type);
        }
        if (filters.fauna !== '') {
          const wantFauna = filters.fauna === 'true';
          filtered = filtered.filter(o => {
            // fauna может быть boolean или number (0/1 из SQLite)
            const hasFauna = o.fauna === true || o.fauna === 1;
            return hasFauna === wantFauna;
          });
        }
        if (filters.condition_min) {
          filtered = filtered.filter(o => o.technical_condition >= filters.condition_min);
        }
        if (filters.condition_max) {
          filtered = filtered.filter(o => o.technical_condition <= filters.condition_max);
        }
        if (filters.priority_level) {
          filtered = filtered.filter(o => o.priority?.level === filters.priority_level);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(o => 
            o.name.toLowerCase().includes(search) ||
            o.region.toLowerCase().includes(search) ||
            (o.description && o.description.toLowerCase().includes(search))
          );
        }
        
        set({ filteredObjects: filtered });
      },
      
      resetFilters: () => {
        set({ 
          filters: {
            region: '',
            resource_type: '',
            water_type: '',
            fauna: '',
            condition_min: 1,
            condition_max: 5,
            priority_level: '',
            search: ''
          },
          filteredObjects: get().objects
        });
      },
      
      toggleFilters: () => set(s => ({ showFilters: !s.showFilters })),
      togglePriorityTable: () => set(s => ({ showPriorityTable: !s.showPriorityTable })),
      toggleAssistant: () => set(s => ({ showAssistant: !s.showAssistant })),
      toggleRoute: () => set(s => ({ showRoute: !s.showRoute })),
      
      setMapView: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
      
      setInspectionRoute: (route) => set({ inspectionRoute: route }),
    }),
    {
      name: 'gidroatlas-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)

