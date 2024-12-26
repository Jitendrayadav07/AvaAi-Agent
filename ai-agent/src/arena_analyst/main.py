#!/usr/bin/env python
from random import randint

from pydantic import BaseModel

from crewai.flow.flow import Flow, listen, start

from .crews.poem_crew.poem_crew import PoemCrew
# from .crews.avax_crew.avax_crew import AvaxCrew
import json
import requests


class PoemState(BaseModel):
    sentence_count: int = 1
    poem: str = ""


class PoemFlow(Flow[PoemState]):
    urls = {
        "fear": "https://static.starsarena.com/uploads/f8a5e016-2b6d-96a5-1012-ddae196222b11732018423059.png",
        "extreme_fear": "https://static.starsarena.com/uploads/dd889002-5ea2-4223-57b9-ce50cc70599a1732353929084.jpeg",
        "greed":"https://static.starsarena.com/uploads/a942f99d-58af-0bf7-443c-cb5514c824841732354047922.jpeg",
        "extreme_greed":"https://static.starsarena.com/uploads/db16c65c-55d1-7128-0a6a-b011ef48c4981732354088127.jpeg"
    }

    @start()
    def generate_poem(self):
        # print("Generating poem")
        result = (
            PoemCrew()
            .crew()
            .kickoff(inputs={"sentence_count": self.state.sentence_count})
        )

        print("Poem generated", result.raw)
        self.state.poem = result.raw

    @listen(generate_poem)
    def posting_to_arena(self):
        print("Saving poem", self.state.poem)
        data = json.loads(self.state.poem)
        
        # Determine sentiment based on score
        if data["score"] < 25:
            data["sentiment"] = "Extreme Fear"
        elif 25 <= data["score"] < 50:
            data["sentiment"] = "Fear"
        elif 50 <= data["score"] < 75:
            data["sentiment"] = "Greed"
        else:
            data["sentiment"] = "Extreme Greed"
          
        url = "https://pharmaalabs.com/v1/arena-post"
        headers = {
            "Content-Type": "application/json",
        }
  
        payload = {
            "content": "<p>" + f"Arena Fear and Greed Index is {data['score']} ~ {data['sentiment'].capitalize()}" + "</p>",
            "privacyType": 0,
            "files": [
                    {
                    "isLoading": False,
                    "previewUrl": "",
                    "url": "",
                    "fileType": "image",
                    "size": 52780
                }
            ],
            "score": data["score"]
        }

        # if data["score"] < 25:
        #     selected_url = self.urls["extreme_fear"]
        # elif 25 <= data["score"] < 50:
        #     selected_url = self.urls["fear"]
        # elif 50 <= data["score"] < 75:
        #     selected_url = self.urls["greed"]
        # else:
        #     selected_url = self.urls["extreme_greed"]

        # Assign the selected URL to both url and previewUrl
        payload['files'][0]['url'] = "selected_url"
        payload['files'][0]['previewUrl'] = "selected_url"

        try:
            print("try")
            # Sending a POST request
            response = requests.post(url, json = payload, headers=headers)
            response.raise_for_status()

            print("response", response)
            # Check if the request was successful
            if response.status_code == 200:
                # Parse JSON response
                data = response.json()
                print("Login Successful:", data)
            else:
                print("Error:", response.status_code, response.text)
        except Exception as e:
            print("An error occurred:", e)




def kickoff():
    poem_flow = PoemFlow()
    poem_flow.kickoff()
    
    # poem_flow = AvaxCrew().crew()
    # poem_flow.kickoff()

if __name__ == "__main__":
    kickoff()

