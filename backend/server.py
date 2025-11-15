from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv  # Add this line
import subprocess
import json
import os
from pathlib import Path
import numpy as np

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

# Store Sphinx API key (you'll get this from Sphinx dashboard)
SPHINX_API_KEY = os.environ.get('SPHINX_API_KEY', '')

@app.route('/api/analyze-site', methods=['POST'])
def analyze_site():
    """
    Receives AlphaEarth embeddings and uses Sphinx AI to analyze them
    """
    data = request.json
    
    # Extract data from request
    embeddings = data.get('embeddings')  # 64D vector from AlphaEarth
    location = data.get('location')  # {lat, lon}
    project_type = data.get('projectType')  # e.g., "Kelp Cultivation"
    
    # Create or load notebook for analysis
    notebook_path = create_analysis_notebook(embeddings, location, project_type)
    
    # Use Sphinx CLI to analyze the data
    prompt = f"""
    Analyze these ocean site embeddings for {project_type}:
    
    Location: {location['lat']}, {location['lon']}
    AlphaEarth Embeddings (64-dimensional): {embeddings[:10]}... (truncated)
    
    Tasks:
    1. Interpret what these embeddings likely represent in terms of ocean conditions
    2. Map the embeddings to specific oceanographic metrics like:
       - Water temperature
       - Chlorophyll concentration (productivity)
       - Wave energy
       - Water depth
       - Nutrient levels
    3. Calculate a suitability score (0-100) for {project_type}
    4. Identify the top 3 strengths and any concerns for this site
    5. Provide a deployment recommendation
    
    Return results as a JSON object with the structure:
    {{
        "score": <number>,
        "metrics": {{"temperature": <value>, "chlorophyll": <value>, ...}},
        "strengths": [<list>],
        "concerns": [<list>],
        "recommendation": <string>
    }}
    """
    
    # Run Sphinx CLI
    result = run_sphinx_analysis(notebook_path, prompt)
    
    return jsonify(result)


@app.route('/api/rank-sites', methods=['POST'])
def rank_sites():
    """
    Receives multiple sites and uses Sphinx AI to rank them
    """
    data = request.json
    sites = data.get('sites')  # Array of site objects
    project_type = data.get('projectType')
    
    notebook_path = 'notebooks/ranking_analysis.ipynb'
    
    prompt = f"""
    Rank these {len(sites)} ocean sites for {project_type} deployment.
    
    Sites data:
    {json.dumps(sites, indent=2)}
    
    For each site:
    1. Analyze its AlphaEarth embeddings
    2. Calculate oceanographic metrics
    3. Compute a suitability score (0-100)
    4. Identify key advantages and risks
    
    Return a ranked list (best to worst) with detailed analysis for each site.
    Format as JSON array of objects with: rank, site_id, score, metrics, analysis
    """
    
    result = run_sphinx_analysis(notebook_path, prompt)
    
    return jsonify(result)


@app.route('/api/compare-sites', methods=['POST'])
def compare_sites():
    """
    Compare 2-5 sites side-by-side using Sphinx AI
    """
    data = request.json
    sites = data.get('sites')  # 2-5 sites to compare
    project_type = data.get('projectType')
    
    notebook_path = 'notebooks/comparison_analysis.ipynb'
    
    prompt = f"""
    Compare these ocean sites for {project_type}:
    
    {json.dumps(sites, indent=2)}
    
    Provide a comprehensive comparison including:
    1. Side-by-side metric comparison table
    2. Which site is best for specific conditions (e.g., "Best for calm waters", "Best productivity")
    3. Trade-offs between sites
    4. Final recommendation with confidence level
    
    Return as structured JSON.
    """
    
    result = run_sphinx_analysis(notebook_path, prompt)
    
    return jsonify(result)


def create_analysis_notebook(embeddings, location, project_type):
    """
    Create a Jupyter notebook with the data pre-loaded
    """
    notebook_dir = Path('notebooks')
    notebook_dir.mkdir(exist_ok=True)
    
    notebook_path = notebook_dir / f'site_analysis_{location["lat"]}_{location["lon"]}.ipynb'
    
    # Create notebook with data
    notebook_content = {
        "cells": [
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    f"import numpy as np\n",
                    f"import pandas as pd\n",
                    f"\n",
                    f"# Site data\n",
                    f"embeddings = np.array({embeddings})\n",
                    f"location = {location}\n",
                    f"project_type = '{project_type}'\n",
                    f"\n",
                    f"print(f'Analyzing site at {{location}}')\n",
                    f"print(f'Embeddings shape: {{embeddings.shape}}')\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": ["# Ocean Site Analysis\n", "Let Sphinx analyze this data..."]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    
    with open(notebook_path, 'w') as f:
        json.dump(notebook_content, f, indent=2)
    
    return str(notebook_path)


def run_sphinx_analysis(notebook_path, prompt):
    """
    Execute Sphinx CLI and parse results
    """
    try:
        # Set environment variable for API key
        env = os.environ.copy()
        env['SPHINX_API_KEY'] = SPHINX_API_KEY
        
        # Run Sphinx CLI
        cmd = [
            'sphinx-cli', 'chat',
            '--notebook-filepath', notebook_path,
            '--prompt', prompt
        ]
        
        result = subprocess.run(
            cmd,
            env=env,
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout
        )
        
        # Parse Sphinx output
        output = result.stdout
        
        # Extract JSON from Sphinx response
        # Sphinx will return analysis in the notebook or as output
        # Parse accordingly
        
        # For now, return parsed result
        analysis_result = parse_sphinx_output(output)
        
        return {
            'success': True,
            'data': analysis_result
        }
        
    except subprocess.TimeoutExpired:
        return {'success': False, 'error': 'Analysis timed out'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def parse_sphinx_output(output):
    """
    Parse Sphinx CLI output to extract analysis results
    """
    # Sphinx will return results - parse JSON from output
    # This depends on how Sphinx formats its responses
    
    try:
        # Look for JSON in the output
        # Sphinx typically returns structured data
        lines = output.split('\n')
        for line in lines:
            if line.strip().startswith('{'):
                return json.loads(line)
        
        # Fallback: return raw output
        return {'raw_output': output}
    except:
        return {'raw_output': output}


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'sphinx_configured': bool(SPHINX_API_KEY)})


if __name__ == '__main__':
    print("🚀 OceanCarbon AI Backend Server Starting...")
    print(f"📊 Sphinx AI: {'Configured ✓' if SPHINX_API_KEY else 'Not configured ✗'}")
    print("🌊 Ready to analyze ocean sites!\n")
    
    app.run(debug=True, port=5000)