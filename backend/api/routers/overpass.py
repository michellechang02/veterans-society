from fastapi import APIRouter, HTTPException, Query
import os
import requests

router = APIRouter(
    prefix="/overpass",
    tags=["overpass"]
)


OVERPASS_ENDPOINT = os.getenv('OVERPASS_ENDPOINT', 'https://overpass-api.de/api/interpreter')
SEARCH_RADIUS_METERS = int(os.getenv('SEARCH_RADIUS_METERS', 5000))  # 5km radius

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
async def get_veteran_resources(lat: float = Query(...), lon: float = Query(...)):
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
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch veteran resources: {str(e)}")