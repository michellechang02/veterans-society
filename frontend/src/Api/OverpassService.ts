// Types for Overpass API responses and our normalized data
interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    'addr:state'?: string;
    'addr:postcode'?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export interface VeteranResource {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const SEARCH_RADIUS_METERS = 5000; // 5km radius

export class OverpassService {
  private static buildQuery(lat: number, lon: number): string {
    // Build Overpass query to find veteran-related facilities
    return `[out:json][timeout:25];
      (
        // Find nodes, ways, and relations tagged for veterans
        nwr["social_facility:for"="veterans"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
        // Military facilities that might offer veteran services
        nwr["military"="office"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
        // VA facilities and offices
        nwr["office"="government"]["government"="veterans"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
        // Healthcare facilities specifically for veterans
        nwr["healthcare:speciality"="veterans"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      );
      out body;
      >;
      out skel qt;`;
  }

  private static formatAddress(tags: OverpassElement['tags']): string {
    const parts = [];
    
    if (tags['addr:housenumber']) {
      parts.push(tags['addr:housenumber']);
    }
    
    if (tags['addr:street']) {
      parts.push(tags['addr:street']);
    }
    
    if (tags['addr:city']) {
      parts.push(tags['addr:city']);
    }
    
    if (tags['addr:state']) {
      parts.push(tags['addr:state']);
    }
    
    if (tags['addr:postcode']) {
      parts.push(tags['addr:postcode']);
    }
    
    return parts.join(' ') || 'Address not available';
  }

  private static normalizeResponse(response: OverpassResponse): VeteranResource[] {
    return response.elements
      .filter(element => element.lat && element.lon) // Only include elements with coordinates
      .map(element => ({
        id: element.id,
        name: element.tags.name || `Veteran Resource ${element.id}`,
        latitude: element.lat,
        longitude: element.lon,
        address: this.formatAddress(element.tags)
      }));
  }

  public static async getVeteranResourcesByLocation(lat: number, lon: number): Promise<VeteranResource[]> {
    try {
      const query = this.buildQuery(lat, lon);
      const response = await fetch(OVERPASS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: query
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as OverpassResponse;
      
      // Validate response structure
      if (!data.elements || !Array.isArray(data.elements)) {
        throw new Error('Invalid response structure from Overpass API');
      }

      return this.normalizeResponse(data);
    } catch (error) {
      console.error('Error fetching veteran resources:', error);
      throw error;
    }
  }
}
