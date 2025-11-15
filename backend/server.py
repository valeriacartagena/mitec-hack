"""
OceanCarbon AI Backend Server
Connects React frontend to Sphinx AI for ocean site analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS  # ← Must import
from dotenv import load_dotenv
import subprocess
import json
import os
from pathlib import Path
import numpy as np

load_dotenv()

app = Flask(__name__)
CORS(app)
# Sphinx API key from environment
SPHINX_API_KEY = os.environ.get('SPHINX_API_KEY', '')
CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY', '')

# ============================================================================
# ALPHA EARTH EMBEDDINGS SERVICE
# ============================================================================

class AlphaEarthService:
    """
    Mock service for AlphaEarth embeddings
    Replace with real API calls when available
    """
    
    @staticmethod
    def get_embeddings(lat, lon):
        """
        Generate 64-dimensional embeddings for a location
        
        TODO: Replace with real AlphaEarth API call:
        response = requests.get(
            'https://api.alphaearth.ai/v1/embeddings',
            params={'lat': lat, 'lon': lon},
            headers={'Authorization': f'Bearer {ALPHA_EARTH_KEY}'}
        )
        return np.array(response.json()['embeddings'])
        """
        
        # Generate location-based mock embeddings
        np.random.seed(int((lat + 90) * 1000 + (lon + 180) * 1000))
        embeddings = np.random.randn(64)
        
        # Add realistic patterns based on location
        # Embeddings 0-10: Temperature-related (latitude dependent)
        embeddings[0:10] += (90 - abs(lat)) / 50
        
        # Embeddings 10-20: Productivity-related
        if abs(lon) > 100:  # Pacific/Atlantic
            embeddings[10:20] += np.random.rand(10) * 0.5
        
        # Embeddings 20-30: Depth-related
        embeddings[20:30] -= abs(lat) / 90
        
        # Normalize
        embeddings = (embeddings - embeddings.mean()) / embeddings.std()
        
        return embeddings.tolist()


alphaearth = AlphaEarthService()


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/get-embeddings', methods=['POST'])
def get_embeddings():
    """
    Fetch AlphaEarth embeddings for a location
    """
    data = request.json
    lat = data.get('lat')
    lon = data.get('lon')
    
    if lat is None or lon is None:
        return jsonify({'error': 'Missing lat or lon'}), 400
    
    print(f"📡 Fetching embeddings for {lat}, {lon}")
    embeddings = alphaearth.get_embeddings(lat, lon)
    
    return jsonify({
        'embeddings': embeddings,
        'location': {'lat': lat, 'lon': lon}
    })


@app.route('/api/analyze-site', methods=['POST'])
def analyze_site():
    """
    Analyze a single site using Sphinx AI
    """
    data = request.json
    
    embeddings = data.get('embeddings')
    location = data.get('location')
    project_type = data.get('projectType')
    
    print(f"🤖 Analyzing site: {location} for {project_type}")
    
    # Create notebook with data
    notebook_path = create_analysis_notebook(embeddings, location, project_type)
    
    # Create Sphinx prompt
    prompt = f"""
Analyze this ocean site for {project_type}:

Location: {location['lat']}, {location['lon']}
AlphaEarth Embeddings: 64-dimensional vector (first 10 values: {embeddings[:10]})

Tasks:
1. Interpret what these embeddings likely represent in terms of ocean conditions
2. Map the embeddings to specific oceanographic metrics:
   - Water temperature (°C)
   - Chlorophyll concentration (mg/m³) 
   - Wave energy index (0-10)
   - Water depth (m)
   - Nutrient levels (qualitative: Low/Medium/High)
   - pH level
3. Calculate a suitability score (0-100) for {project_type}
4. Identify the top 3 strengths and any concerns
5. Provide a deployment recommendation

Return results as JSON:
{{
    "score": <number 0-100>,
    "metrics": {{
        "temperature": <value>,
        "chlorophyll": <value>,
        "wave_energy": <value>,
        "depth": <value>,
        "nutrients": <string>,
        "ph": <value>
    }},
    "strengths": [<list of 3 strings>],
    "concerns": [<list of strings>],
    "recommendation": <string>
}}

IMPORTANT: Return ONLY valid JSON, no additional text.
"""
    
    # Run Sphinx analysis
    result = run_sphinx_analysis(notebook_path, prompt)
    
    return jsonify(result)


@app.route('/api/rank-sites', methods=['POST'])
def rank_sites():
    """
    Rank multiple sites using Sphinx AI
    """
    data = request.json
    sites = data.get('sites', [])
    project_type = data.get('projectType')
    
    print(f"🚀 Ranking {len(sites)} sites for {project_type}")
    
    # Create notebook for ranking
    notebook_path = create_ranking_notebook(sites, project_type)
    
    # Create Sphinx prompt
    prompt = f"""
Rank these {len(sites)} ocean sites for {project_type} deployment.

Sites with embeddings:
{json.dumps([{{'name': s['name'], 'lat': s['lat'], 'lon': s['lon'], 'embeddings_preview': s['embeddings'][:5]}} for s in sites], indent=2)}

For each site:
1. Analyze its AlphaEarth embeddings to extract ocean metrics
2. Compute a suitability score (0-100) for {project_type}
3. Identify 2-3 key advantages
4. Note any concerns

Return a ranked list (best to worst) as JSON array:
[
    {{
        "rank": 1,
        "name": "<site name>",
        "score": <0-100>,
        "metrics": {{"temperature": X, "chlorophyll": Y, ...}},
        "analysis": {{
            "strengths": ["...", "..."],
            "concerns": ["..."]
        }}
    }},
    ...
]

IMPORTANT: Return ONLY valid JSON array, no additional text.
"""
    
    # Run Sphinx analysis
    result = run_sphinx_analysis(notebook_path, prompt)
    
    return jsonify(result)


@app.route('/api/compare-sites', methods=['POST'])
def compare_sites():
    """
    Compare 2-5 sites side-by-side
    """
    data = request.json
    sites = data.get('sites', [])
    project_type = data.get('projectType')
    
    if len(sites) < 2 or len(sites) > 5:
        return jsonify({'error': 'Can only compare 2-5 sites'}), 400
    
    print(f"🔄 Comparing {len(sites)} sites")
    
    notebook_path = create_comparison_notebook(sites, project_type)
    
    prompt = f"""
Compare these {len(sites)} ocean sites for {project_type}:

{json.dumps(sites, indent=2)}

Provide:
1. Side-by-side metric comparison
2. Best site for specific conditions (e.g., "Best for protected waters")
3. Trade-offs between sites
4. Final recommendation with confidence level

Return as JSON:
{{
    "comparison_table": {{...}},
    "best_for": {{...}},
    "tradeoffs": "...",
    "recommendation": {{
        "site": "...",
        "confidence": <0-100>,
        "reasoning": "..."
    }}
}}

IMPORTANT: Return ONLY valid JSON, no additional text.
"""
    
    result = run_sphinx_analysis(notebook_path, prompt)
    
    return jsonify(result)


@app.route('/api/chat', methods=['POST'])
def chat_with_claude():
    """
    Chat endpoint using Claude API for ocean site questions
    """
    data = request.json
    messages = data.get('messages', [])
    context = data.get('context', {})
    
    if not CLAUDE_API_KEY:
        return jsonify({
            'success': False,
            'message': 'Claude API key not configured. Please add CLAUDE_API_KEY to your .env file.'
        }), 500
    
    try:
        import anthropic
        
        client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
        
        # Build system prompt with context
        system_prompt = f"""You are an expert ocean scientist and AI assistant for OceanCarbon AI, a tool that helps scientists find optimal sites for ocean carbon removal projects.

Current Context:
- Region: {context.get('region', 'Not selected')}
- Project Type: {context.get('projectType', 'Not selected')}
- Analysis Status: {'Completed' if context.get('analysisResults') else 'Not run yet'}

Your role:
- Answer questions about ocean carbon removal, site selection, and oceanographic metrics
- Explain why certain sites are suitable for specific CDR technologies
- Help users understand the data and make deployment decisions
- Be concise but informative
- Use scientific terminology when appropriate but explain it clearly

If analysis results are available, reference them in your answers. If not, guide the user to run an analysis first.
"""

        # Add top sites to context if available
        if context.get('analysisResults'):
            top_sites = context['analysisResults'][:3]
            system_prompt += f"\n\nTop ranked sites from recent analysis:\n{json.dumps(top_sites, indent=2)}"
        
        # Convert messages to Claude format
        claude_messages = []
        for msg in messages:
            if msg['role'] in ['user', 'assistant']:
                claude_messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
        
        print(f"💬 Sending to Claude API... ({len(claude_messages)} messages)")
        
        # Call Claude API
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            system=system_prompt,
            messages=claude_messages
        )
        
        assistant_message = response.content[0].text
        
        print(f"✅ Claude response received ({len(assistant_message)} chars)")
        
        return jsonify({
            'success': True,
            'message': assistant_message
        })
        
    except ImportError:
        return jsonify({
            'success': False,
            'message': 'Anthropic library not installed. Run: pip install anthropic'
        }), 500
    except Exception as e:
        print(f"❌ Claude API error: {e}")
        return jsonify({
            'success': False,
            'message': f'Error communicating with Claude: {str(e)}'
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Check backend health and Sphinx configuration"""
    return jsonify({
        'status': 'ok',
        'sphinx_configured': bool(SPHINX_API_KEY),
        'sphinx_api_key_set': 'SPHINX_API_KEY' in os.environ,
        'claude_configured': bool(CLAUDE_API_KEY),
        'claude_api_key_set': 'CLAUDE_API_KEY' in os.environ
    })


# ============================================================================
# JUPYTER NOTEBOOK CREATION
# ============================================================================

def create_analysis_notebook(embeddings, location, project_type):
    """Create a Jupyter notebook with site data"""
    notebook_dir = Path('notebooks')
    notebook_dir.mkdir(exist_ok=True)
    
    notebook_path = notebook_dir / f'site_analysis_{location["lat"]}_{location["lon"]}.ipynb'
    
    notebook_content = {
        "cells": [
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import numpy as np\n",
                    "import pandas as pd\n",
                    "import json\n",
                    "\n",
                    f"# Site Analysis\n",
                    f"embeddings = np.array({embeddings})\n",
                    f"location = {location}\n",
                    f"project_type = '{project_type}'\n",
                    "\n",
                    "print(f'Analyzing site at {location}')\n",
                    "print(f'Embeddings shape: {embeddings.shape}')\n",
                    "print(f'Project type: {project_type}')\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Ocean Site Analysis\n",
                    "Sphinx AI will analyze this data and provide ocean metrics..."
                ]
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


def create_ranking_notebook(sites, project_type):
    """Create notebook for ranking multiple sites"""
    notebook_dir = Path('notebooks')
    notebook_dir.mkdir(exist_ok=True)
    
    notebook_path = notebook_dir / f'ranking_{project_type.replace(" ", "_")}.ipynb'
    
    notebook_content = {
        "cells": [
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import numpy as np\n",
                    "import pandas as pd\n",
                    "\n",
                    f"# Multi-site Ranking Analysis\n",
                    f"project_type = '{project_type}'\n",
                    f"num_sites = {len(sites)}\n",
                    "\n",
                    "# Sites data loaded\n",
                    f"sites = {json.dumps(sites, indent=2)}\n",
                    "\n",
                    "print(f'Ranking {num_sites} sites for {project_type}')\n"
                ]
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


def create_comparison_notebook(sites, project_type):
    """Create notebook for site comparison"""
    return create_ranking_notebook(sites, f"{project_type}_comparison")


# ============================================================================
# SPHINX CLI EXECUTION
# ============================================================================

def run_sphinx_analysis(notebook_path, prompt):
    """
    Execute Sphinx CLI and parse results
    """
    if not SPHINX_API_KEY:
        print("⚠️ WARNING: SPHINX_API_KEY not set. Using mock data.")
        return {
            'success': True,
            'data': {
                'score': 85,
                'metrics': {'temperature': 14.2, 'chlorophyll': 2.8},
                'message': 'Mock data - set SPHINX_API_KEY for real analysis'
            }
        }
    
    try:
        env = os.environ.copy()
        env['SPHINX_API_KEY'] = SPHINX_API_KEY
        
        cmd = [
            'sphinx-cli', 'chat',
            '--notebook-filepath', notebook_path,
            '--prompt', prompt
        ]
        
        print(f"🤖 Running Sphinx CLI...")
        print(f"📓 Notebook: {notebook_path}")
        
        result = subprocess.run(
            cmd,
            env=env,
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout
        )
        
        if result.returncode != 0:
            print(f"❌ Sphinx CLI error: {result.stderr}")
            return {'success': False, 'error': result.stderr}
        
        # Parse Sphinx output
        output = result.stdout
        print(f"✅ Sphinx output received ({len(output)} chars)")
        
        analysis_result = parse_sphinx_output(output)
        
        return {
            'success': True,
            'data': analysis_result
        }
        
    except subprocess.TimeoutExpired:
        print("❌ Sphinx CLI timed out")
        return {'success': False, 'error': 'Analysis timed out'}
    except Exception as e:
        print(f"❌ Error running Sphinx: {e}")
        return {'success': False, 'error': str(e)}


def parse_sphinx_output(output):
    """
    Parse Sphinx CLI output to extract JSON results
    """
    try:
        # Remove markdown code blocks if present
        output = output.replace('```json\n', '').replace('```\n', '').replace('```', '')
        
        # Try to find JSON in the output
        lines = output.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('{') or line.startswith('['):
                try:
                    return json.loads(line)
                except json.JSONDecodeError:
                    continue
        
        # If no JSON found, return raw output
        print(f"⚠️ Could not parse JSON from Sphinx output")
        return {'raw_output': output}
        
    except Exception as e:
        print(f"❌ Error parsing Sphinx output: {e}")
        return {'error': 'Failed to parse Sphinx output', 'raw': output}


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 OceanCarbon AI Backend Server Starting...")
    print("=" * 60)
    print(f"📊 Sphinx AI: {'Configured ✓' if SPHINX_API_KEY else 'Not configured ✗'}")
    print(f"💬 Claude AI: {'Configured ✓' if CLAUDE_API_KEY else 'Not configured ✗'}")
    print(f"🌐 API URL: http://localhost:5001")
    print(f"🌊 Ready to analyze ocean sites!\n")
    
    if not SPHINX_API_KEY:
        print("⚠️  WARNING: SPHINX_API_KEY not set!")
        print("   Set it with: export SPHINX_API_KEY=your_key_here\n")
    
    if not CLAUDE_API_KEY:
        print("⚠️  WARNING: CLAUDE_API_KEY not set!")
        print("   Set it with: export CLAUDE_API_KEY=your_key_here\n")
    
    app.run(debug=True, port=5001)