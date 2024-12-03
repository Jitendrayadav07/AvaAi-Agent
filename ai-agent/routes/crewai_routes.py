from flask import Blueprint, jsonify, request
# from src.arena_analyst.main import CustomBotFlow
import json
import requests
import os

# /Users/neelkanani/brain-bounty/arena_analyst/src/arena_analyst/crews/avax_crew/avax_crew.py

from src.arena_analyst.crews.avax_crew.avax_crew import AvaxCrew

file_path = os.path.join(os.path.dirname(__file__), '../src/arena_analyst/crews/avax_crew/files/data.json')

crewai_routes = Blueprint('crewai_routes', __name__)

STATS_API_URL = "https://www.dextools.io/shared/data/pair?address=0xd446eb1660f766d533beceef890df7a69d26f7d1&chain=avalanche&audit=false&locks=true"
ORDER_API_URL = "https://pharmaalabs.com/v2/place-order"

@crewai_routes.route('/avax-agent', methods=['GET'])
def agent():
    quantity = request.args.get('quantity')
    if not quantity:
        return jsonify({
            "status": "error",
            "message": "Quantity parameter is required"
        }), 400
    # https://jsonplaceholder.typicode.com/posts
    
    #todo fetch the data
    headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://www.dextools.io/',
    }

    get_stats_call = requests.get(STATS_API_URL, headers=headers)
    
    
    with open(file_path, 'w') as json_file:
        json.dump(get_stats_call.json(), json_file, indent=4)
        
        
    # get-stats completed
    avax_crew = AvaxCrew().crew()
    crew_result = avax_crew.kickoff()
    print(crew_result.raw)
    json_response = json.loads(crew_result.raw)
    json_response['order_type'] = json_response['recommendation']
    json_response['size'] = int(quantity)
    
    print(json_response)

    # then run the agent
    
    # this will post the dataa

    
    try:
        # Make a POST request to the external API
        print("hi")
        external_response = requests.post(ORDER_API_URL, json=json_response)
        external_data = external_response.json()
        
        # # Combine the received data with the external API response
        return external_data
    except requests.exceptions.RequestException as e:
        # Handle API request errors
        response = {
            "status": "error",
            "message": "Failed to fetch data from the external API",
            "error": str(e)
        }

