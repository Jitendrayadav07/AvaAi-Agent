from typing import Type, Any
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from embedchain.loaders.mysql import MySQLLoader
from crewai_tools import RagTool

class DbConfig(BaseModel):
    host: str = Field(..., description="Database host address")
    port: int = Field(..., description="Database port number")
    database: str = Field(..., description="Database name")
    user: str = Field(..., description="Database username")
    password: str = Field(default="", description="Database password")


class MySqlSearchToolInput(BaseModel):
    """Input for MySQLSearchTool."""

    search_query: str = Field(
        ...,
        description="Mandatory semantic search query you want to use to search the database's content",
    )
    
class MySqlSearchTool(RagTool):
    name: str = "Search a database's table content"
    description: str = (
        "A tool that can be used to semantic search a query from a database table's content."
    )   
    args_schema: Type[BaseModel] = MySqlSearchToolInput
    # db_config: DbConfig = Field(..., description="Database configuration")
    # db_uri: str = Field(..., description="Mandatory database URI")

    def __init__(self, table_name: str,db_config: dict, **kwargs):
        super().__init__(**kwargs)  
        kwargs["data_type"] = "mysql"
        self.add(table_name)
        self.add(db_config)
        kwargs["loader"] = MySQLLoader(config=db_config)
        self.description = f"A tool that can be used to semantic search a query the {table_name} database table's content."
        self._generate_description()

    def add(
        self,
        table_name: str,
        **kwargs: Any,
    ) -> None:
        super().add(f"SELECT * FROM {table_name};", **kwargs)

    def _run(
        self,
        search_query: str,
        **kwargs: Any,
    ) -> Any:
        return super()._run(query=search_query)