// Shared service for managing providers
// This simulates a backend API - replace with real API calls later

// Utility functions for categories and cities
export const getAllCategories = () => [
  { id: 'all', title: 'Tous les services' },
  { id: 'Photographe', title: 'Photographe' },
  { id: 'Negafa', title: 'Negafa' },
  { id: 'Maquilleur', title: 'Maquilleur' },
  { id: 'Coiffeur', title: 'Coiffeur' },
  { id: 'Traiteur', title: 'Traiteur' },
  { id: 'Décorateur', title: 'Décorateur' },
  { id: 'Fleuriste', title: 'Fleuriste' },
  { id: 'DJ', title: 'DJ' },
  { id: 'Location', title: 'Location de matériel' }
];

export const getUniqueCities = () => [
  'Casablanca',
  'Rabat', 
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kenitra',
  'Tétouan'
];

class ProviderService {
  constructor() {
    this.storageKey = 'aarssi_providers';
    this.initializeStorage();
  }

  // Initialize localStorage with default data if empty
  initializeStorage() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      const defaultProviders = [
        { 
          id: 1, 
          name: "Studio Photo Marrakech", 
          email: "studio@example.com", 
          status: "approved", 
          service: "Photographe", 
          city: "Marrakech", 
          country: "Morocco",
          phone: "+212 612345678", 
          createdDate: "2024-01-15" 
        },
        { 
          id: 2, 
          name: "Negafa Luxury", 
          email: "negafa@example.com", 
          status: "approved", 
          service: "Negafa", 
          city: "Casablanca", 
          country: "Morocco",
          phone: "+212 623456789", 
          createdDate: "2024-01-10" 
        }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(defaultProviders));
    }
  }

  // Get all providers
  getAllProviders() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Get provider by ID
  getProviderById(id) {
    const providers = this.getAllProviders();
    return providers.find(p => p.id === id);
  }

  // Create new provider (with pending status)
  createProvider(providerData) {
    const providers = this.getAllProviders();
    
    // Generate sequential ID (find max ID and add 1)
    const maxId = providers.length > 0 
      ? Math.max(...providers.map(p => p.id)) 
      : 0;
    
    const newProvider = {
      id: maxId + 1, // Sequential ID: 1, 2, 3, 4...
      ...providerData,
      status: "pending", // Always pending initially
      createdDate: new Date().toISOString().split('T')[0],
      email: providerData.email || `${providerData.profileName.toLowerCase().replace(/\s+/g, '')}@example.com`
    };
    
    providers.push(newProvider);
    localStorage.setItem(this.storageKey, JSON.stringify(providers));
    return newProvider;
  }

  // Update provider
  updateProvider(id, updatedData) {
    const providers = this.getAllProviders();
    const index = providers.findIndex(p => p.id === id);
    
    if (index !== -1) {
      providers[index] = { ...providers[index], ...updatedData };
      localStorage.setItem(this.storageKey, JSON.stringify(providers));
      return providers[index];
    }
    return null;
  }

  // Update provider status
  updateProviderStatus(id, newStatus) {
    return this.updateProvider(id, { status: newStatus });
  }

  // Delete provider
  deleteProvider(id) {
    const providers = this.getAllProviders();
    const filtered = providers.filter(p => p.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return true;
  }

  // Get providers by status
  getProvidersByStatus(status) {
    const providers = this.getAllProviders();
    return providers.filter(p => p.status === status);
  }

  // Get pending providers count
  getPendingCount() {
    return this.getProvidersByStatus('pending').length;
  }
}

// Export singleton instance
const providerService = new ProviderService();
export default providerService;
