import flwr as fl
import numpy as np
from sklearn.linear_model import LogisticRegression

# 1. Local Homogeneous Dataset Profile (Skewed heavy to fast food & study spend codes)
X_train = np.array([[12.50, 8], [8.20, 11], [15.40, 13], [6.50, 17], [85.00, 10]]) # [Amount, Hour]
y_train = np.array([0, 0, 0, 0, 1]) # 0: Food, 1: Bills

X_test = np.array([[9.00, 12], [95.00, 9]])
y_test = np.array([0, 1])

# Initialize local seed model
model = LogisticRegression(warm_start=True, max_iter=1)
model.fit(X_train, y_train)

class FinVaultStudentClient(fl.client.NumPyClient):
    def get_parameters(self, config):
        if not hasattr(model, "coef_"):
            return []
        return [model.coef_, model.intercept_]

    def fit(self, parameters, config):
        if len(parameters) > 0:
            model.coef_ = np.array(parameters[0])
            model.intercept_ = np.array(parameters[1])
        # Local Optimization Step
        model.fit(X_train, y_train)
        print(" -> Student Client finished local local training step.")
        return [model.coef_, model.intercept_], len(X_train), {}

    def evaluate(self, parameters, config):
        model.coef_ = np.array(parameters[0])
        model.intercept_ = np.array(parameters[1])
        loss = 1.0 / model.score(X_test, y_test)
        accuracy = model.score(X_test, y_test)
        return float(loss), len(X_test), {"accuracy": float(accuracy), "loss": float(loss)}

if __name__ == "__main__":
    fl.client.start_client(server_address="127.0.0.1:8080", client=FinVaultStudentClient().to_client())