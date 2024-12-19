import os, sys, modal
from modal import Image, Mount, App, asgi_app, Volume
from fastapi.staticfiles import StaticFiles

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Use existing volume
models_volume = Volume.from_name("eedi_data_models")

# Define the image first
image = (modal.Image.debian_slim(python_version="3.12")
         .pip_install(
             "vllm==0.6.4post1",
             "fastapi[standard]==0.115.4",
             "torch",
             "transformers==4.46.1",
             "pandas",
             "peft",
             "bitsandbytes",
             "tqdm",
             "joblib"
         ))

app = App("eedi")

# Mount directories
frontend_mount = Mount.from_local_dir(
    "../eedi_frontend/dist/", 
    remote_path="/app/frontend"
)

backend_mount = Mount.from_local_dir(
    ".", 
    remote_path="/app/backend"
)

@app.function(
    image=image, 
    mounts=[frontend_mount, backend_mount],
    volumes={"/root/cache": models_volume},
    gpu="A10G"
)
@asgi_app()
def misconception_analyzer():
    sys.path.append("/app/backend")
    
    # Import the create_app function
    from eedi_api_service.create_app import create_app
    
    # Create the FastAPI application
    fapi_app = create_app()
    
    # Logging for debugging
    print(f"Current working directory: {os.getcwd()}")
    print(f"Contents of /app: {os.listdir('/app')}")
    print(f"Contents of /: {os.listdir('/')}")
    print(f"Python path: {sys.path}")
    print(f"Contents of /root/cache: {os.listdir('/root/cache')}")

    try:
        print(f"Contents of /app/frontend: {os.listdir('/app/frontend')}")
        print(f"Contents of /app/backend: {os.listdir('/app/backend')}")
    except FileNotFoundError as e:
        print(f"Directory not found error: {e}")
    
    # Serve the static files (React frontend)
    fapi_app.mount("/", StaticFiles(directory="/app/frontend", html=True), name="frontend")
    return fapi_app

if __name__ == "__main__":
    app.serve()