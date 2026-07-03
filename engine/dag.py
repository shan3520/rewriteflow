"""DAG dependency resolution solver."""
from typing import List, Dict, Set
from collections import defaultdict, deque

class DAGSolver:
    def __init__(self, nodes_deps: Dict[str, List[str]]):
        self.deps = nodes_deps

    def get_execution_order(self) -> List[str]:
        in_degree = defaultdict(int)
        all_nodes = set(self.deps.keys())
        for node, parents in self.deps.items():
            for p in parents:
                all_nodes.add(p)
                in_degree[node] += 1

        queue = deque([n for n in all_nodes if in_degree[n] == 0])
        order = []
        while queue:
            curr = queue.popleft()
            order.append(curr)
            for node, parents in self.deps.items():
                if curr in parents:
                    in_degree[node] -= 1
                    if in_degree[node] == 0:
                        queue.append(node)
        return order
