"""Workflow YAML/JSON Parser."""
import json

class WorkflowParser:
    @staticmethod
    def parse_dict(data: dict):
        name = data.get("name", "Untitled Workflow")
        nodes_config = data.get("nodes", [])
        return {
            "name": name,
            "nodes": nodes_config
        }

    @staticmethod
    def parse_json(json_str: str):
        data = json.loads(json_str)
        return WorkflowParser.parse_dict(data)
