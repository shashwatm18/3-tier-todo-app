# test_main.py
from fastapi.testclient import TestClient

from app.main import app

# Create a test client using the FastAPI app
client = TestClient(app)


def test_read_root():
    # Make a GET request to the root endpoint
    response = client.get("/")

    # Assertions to check if the API behaves correctly
    assert response.status_code == 200
