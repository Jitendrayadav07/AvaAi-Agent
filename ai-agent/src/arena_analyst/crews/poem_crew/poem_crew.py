from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

	
import os
from crewai_tools import FileReadTool


file_path = os.path.join(os.path.dirname(__file__), './files/data.json')
file_read_tool = FileReadTool(file_path=file_path)

	
from ...tools.sql_search_tool import MySqlSearchTool

from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()


sql_tool = MySqlSearchTool(
    db_config = {
	    "host": os.getenv("DB_HOST"),
		"port": os.getenv("DB_PORT"),
		"database": os.getenv("DB_DATABASE"),
		"user": os.getenv("DB_USER"),
		"password": os.getenv("DB_PASSWORD"),
        
    },
    table_name='tbl_arena_transactions'
)


@CrewBase
class PoemCrew():
	"""Poem Crew"""

	agents_config = 'config/agents.yaml'
	tasks_config = 'config/tasks.yaml'

	@agent
	def arena_social_analyst(self) -> Agent:
		return Agent(
			config=self.agents_config['arena_social_analyst'],
			tools=[file_read_tool]
		)
  
	@agent
	def arena_volume_analyst(self) -> Agent:
		return Agent(
			config=self.agents_config['arena_volume_analyst'],
			tools=[sql_tool],
			temperature=0.3
		)
  
	@agent
	def arena_team_leader(self) -> Agent:
		return Agent(
			config=self.agents_config['arena_team_leader'],
			temperature=0.3
		)
   

	@task
	def arena_social_analyst_task(self) -> Task:
		return Task(
			config=self.tasks_config['arena_social_analyst_task'],
		)
  
	@task
	def arena_volume_analyst_task(self) -> Task:
		return Task(
			config=self.tasks_config['arena_volume_analyst_task'],
		)
  
	@task
	def arena_team_leader_task(self) -> Task:
		return Task(
			config=self.tasks_config['arena_team_leader_task'],
		)
  
  

	@crew
	def crew(self) -> Crew:
		"""Creates the Research Crew"""
		return Crew(
			agents=self.agents, # Automatically created by the @agent decorator
			tasks=self.tasks, # Automatically created by the @task decorator
			process=Process.sequential,
			verbose=True,
		)
