import numpy as np
import requests

class AlphaEarthService:
    """
    Service to interact with AlphaEarth API
    """
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.base_url = "https://api.alphaearth.ai/v1"  # Replace with actual URL
    
    def get_embeddings(self, lat, lon, date=None):
        """
        Fetch 64-dimensional embeddings for a location
        
        Args:
            lat: Latitude
            lon: Longitude  
            date: Optional date (defaults to most recent)
        
        Returns:
            64-dimensional numpy array
        """
        # TODO: Replace with actual AlphaEarth API call when available
        # For now, generate mock embeddings based on location
        
        try:
            # Actual API call would look like:
            # response = requests.get(
            #     f"{self.base_url}/embeddings",
            #     params={'lat': lat, 'lon': lon, 'date': date},
            #     headers={'Authorization': f'Bearer {self.api_key}'}
            # )
            # return np.array(response.json()['embeddings'])
            
            # Mock embeddings for demo
            return self._generate_mock_embeddings(lat, lon)
            
        except Exception as e:
            print(f"Error fetching AlphaEarth data: {e}")
            return self._generate_mock_embeddings(lat, lon)
    
    def _generate_mock_embeddings(self, lat, lon):
        """
        Generate realistic-looking mock embeddings based on location
        """
        # Set seed based on location for consistency
        np.random.seed(int((lat + 90) * 1000 + (lon + 180) * 1000))
        
        # Generate 64D vector with realistic patterns
        embeddings = np.random.randn(64)
        
        # Add location-based patterns
        # Embeddings 0-10: Temperature-related (latitude dependent)
        embeddings[0:10] += (90 - abs(lat)) / 50
        
        # Embeddings 10-20: Productivity-related (coastal vs open ocean)
        if abs(lon) > 100:  # Pacific/Atlantic
            embeddings[10:20] += np.random.rand(10) * 0.5
        
        # Embeddings 20-30: Depth-related
        embeddings[20:30] -= abs(lat) / 90
        
        # Normalize
        embeddings = (embeddings - embeddings.mean()) / embeddings.std()
        
        return embeddings
    
    def batch_get_embeddings(self, locations):
        """
        Fetch embeddings for multiple locations
        
        Args:
            locations: List of (lat, lon) tuples
        
        Returns:
            List of 64D numpy arrays
        """
        return [self.get_embeddings(lat, lon) for lat, lon in locations]