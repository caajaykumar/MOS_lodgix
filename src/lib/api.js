import LODGIX_CONFIG from '@/config/lodgix';

const API_BASE_URL = LODGIX_CONFIG.API_BASE_URL;

export async function fetchProperties() {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/`, {
      method: 'GET',
      headers: LODGIX_CONFIG.getHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

export async function fetchPropertyPhotos(propertyId) {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/photos/`, {
      method: 'GET',
      headers: LODGIX_CONFIG.getHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error(`Error fetching photos for property ${propertyId}:`, error);
    return [];
  }
}
