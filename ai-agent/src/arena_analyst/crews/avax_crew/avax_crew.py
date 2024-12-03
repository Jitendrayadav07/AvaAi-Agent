from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

import os
from crewai_tools import FileReadTool
file_path = os.path.join(os.path.dirname(__file__), './files/data.json')
file_read_tool = FileReadTool(file_path=file_path)

@CrewBase
class AvaxCrew():
	"""AvaxCrew crew"""

	agents_config = 'config/agents.yaml'
	tasks_config = 'config/tasks.yaml'

	@agent
	def researcher(self) -> Agent:
		return Agent(
			config=self.agents_config['researcher'],
			tools=[file_read_tool],
			verbose=True
		)
  
	@task
	def research_task(self) -> Task:
		return Task(
			config=self.tasks_config['research_task'],
		)

	@crew
	def crew(self) -> Crew:
		"""Creates the AvaxCrew crew"""
		return Crew(
			agents=self.agents, # Automatically created by the @agent decorator
			tasks=self.tasks, # Automatically created by the @task decorator
			process=Process.sequential,
			verbose=True,
			# process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
		)
  
  
# def kickoff2():
#     avax_crew = AvaxCrew().crew()
#     avax_crew.kickoff()
  
# if __name__ == "__main__":
#     kickoff2()
