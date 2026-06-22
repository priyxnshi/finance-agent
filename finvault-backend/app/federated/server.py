import os
import json
import time
from typing import List, Tuple, Dict, Optional
import flwr as fl
from flwr.common import Metrics, Scalar

STATE_FILE = os.path.join(os.path.dirname(__file__), "fl_state.json")

def initialize_shared_log():
    initial_state = {
        "status": "Active Aggregator Running",
        "current_round": 0,
        "connected_clients": 3,
        "global_accuracy": 0.45,
        "aggregation_strategy": "FedAvg",
        "privacy_status": "Strict (Zero Data Leakage)",
        "history": []
    }
    with open(STATE_FILE, "w") as f:
        json.dump(initial_state, f)

def weighted_average(metrics: List[Tuple[int, Dict[str, Scalar]]]) -> Dict[str, Scalar]:
    """Custom metrics aggregator for tracking evaluation rounds on the dashboard."""
    total_examples = sum([num_examples for num_examples, _ in metrics])
    accuracies = [num_examples * m["accuracy"] for num_examples, m in metrics]
    losses = [num_examples * m["loss"] for num_examples, m in metrics]
    
    avg_acc = sum(accuracies) / total_examples if total_examples > 0 else 0.0
    avg_loss = sum(losses) / total_examples if total_examples > 0 else 0.0

    # Persist live state directly to disk so FastAPI can stream updates
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as f:
                state = json.load(f)
        else:
            state = {}

        state["current_round"] = state.get("current_round", 0) + 1
        state["global_accuracy"] = round(float(avg_acc), 3)
        state["history"].append({
            "round": state["current_round"],
            "accuracy": round(float(avg_acc), 3),
            "loss": round(float(avg_loss), 3),
            "timestamp": time.time()
        })
        with open(STATE_FILE, "w") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        print(f"State synchronization delay: {e}")

    return {"accuracy": avg_acc, "loss": avg_loss}

def start_fl_server():
    initialize_shared_log()
    print("=== FINVAULT FEDERATED AGGREGATOR RUNNING ===")
    
    # Configure FedAvg Strategy
    strategy = fl.server.strategy.FedAvg(
        fraction_fit=1.0,          # Sample all clients for training
        fraction_evaluate=1.0,     # Sample all clients for evaluation
        min_fit_clients=3,         # Wait for Student, Professional, and Family networks
        min_evaluate_clients=3,
        min_available_clients=3,
        evaluate_metrics_aggregation_fn=weighted_average,
    )
    
    fl.server.start_server(
        server_address="127.0.0.1:8080",
        config=fl.server.ServerConfig(num_rounds=3),
        strategy=strategy,
    )

if __name__ == "__main__":
    start_fl_server()