from fastapi import APIRouter, HTTPException, Query
import os
import requests
import time
from functools import lru_cache

router = APIRouter(
    prefix="/overpass",
    tags=["overpass"]
)


OVERPASS_ENDPOINT = os.getenv('OVERPASS_ENDPOINT', 'https://overpass-api.de/api/interpreter')
SEARCH_RADIUS_METERS = int(os.getenv('SEARCH_RADIUS_METERS', 5000))  # 5km radius
NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/reverse"
GEOCODE_DELAY = 1.0  # 1 second delay between geocoding requests to comply with usage policy

# Cache for geocoding results - stores up to 100 most recent results
@lru_cache(maxsize=100)
def get_address_from_coordinates_cached(lat: float, lon: float) -> str:
    """Cached version of reverse geocoding to reduce API calls"""
    return _get_address_from_coordinates(lat, lon)

def _get_address_from_coordinates(lat: float, lon: float) -> str:
    """Get address from coordinates using Nominatim reverse geocoding API"""
    try:
        response = requests.get(
            NOMINATIM_ENDPOINT,
            params={
                "lat": lat,
                "lon": lon,
                "format": "json",
                "addressdetails": 1,
                "zoom": 18
            },
            headers={"User-Agent": "VeteranSocietyApp/1.0"},
            timeout=5
        )
        
        if response.status_code != 200:
            return ""
            
        data = response.json()
        if "display_name" in data:
            return data["display_name"]
        return ""
    except Exception:
        return ""

async def get_address_from_coordinates(lat: float, lon: float) -> str:
    """Get address from coordinates using cached function"""
    # Round coordinates to reduce cache misses for very close points
    rounded_lat = round(lat, 5)  # About 1.1 meters precision
    rounded_lon = round(lon, 5)
    
    return get_address_from_coordinates_cached(rounded_lat, rounded_lon)

def build_query(lat: float, lon: float) -> str:
    return f"""
    [out:json][timeout:25];
    (
      nwr["social_facility:for"="veterans"](around:{SEARCH_RADIUS_METERS},{lat},{lon});
      nwr["military"="office"](around:{SEARCH_RADIUS_METERS},{lat},{lon});
      nwr["office"="government"]["government"="veterans"](around:{SEARCH_RADIUS_METERS},{lat},{lon});
      nwr["healthcare:speciality"="veterans"](around:{SEARCH_RADIUS_METERS},{lat},{lon});
    );
    out body;
    >;
    out skel qt;
    """

@router.get("/veteran-resources")
async def get_veteran_resources(lat: float = Query(...), lon: float = Query(...), geocode: bool = Query(True)):
    try:
        query = build_query(lat, lon)
        response = requests.post(
            OVERPASS_ENDPOINT,
            data=query,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10  # Set a timeout of 10 seconds
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching data from Overpass API")

        data = response.json()
        
        # Process the elements to add proper addresses where needed, but only if geocode=True
        if geocode and "elements" in data:
            # Count how many elements need geocoding
            need_geocoding = []
            
            for i, element in enumerate(data["elements"]):
                if ("lat" in element and "lon" in element and 
                    (("tags" not in element) or 
                     not any(key.startswith("addr:") for key in element.get("tags", {})))):
                    
                    # Add element to geocoding queue if it has coordinates but no address
                    if "tags" in element:
                        need_geocoding.append((i, element["lat"], element["lon"]))
            
            # Process geocoding with rate limiting
            for i, (element_index, lat, lon) in enumerate(need_geocoding):
                # Rate limit to avoid overwhelming Nominatim
                if i > 0:
                    time.sleep(GEOCODE_DELAY)
                
                address = await get_address_from_coordinates(lat, lon)
                if address and "tags" in data["elements"][element_index]:
                    data["elements"][element_index]["tags"]["generated_address"] = address
        
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch veteran resources: {str(e)}")

@router.get("/reverse-geocode")
async def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    """Get address from coordinates using reverse geocoding"""
    try:
        address = await get_address_from_coordinates(lat, lon)
        return {"address": address}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reverse geocode: {str(e)}")