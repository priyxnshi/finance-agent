import flwr as fl
import numpy as np
from sklearn.linear_model import LogisticRegression

# 2. Professional Profile Dataset (Balanced recurring subscriptions and high travel charges)
X_train = np.array([[120.00, 18], [45.00, 8], [210.00, 14], [9.99, 0], [15.00, 7]])
y_train = np.array([1, 0, 1, 1, 0]) 

X_test = np.array([[14.99, 0], [180.00, 19]])
y_test = np.array([1, 1])

model = LogisticRegression(warm_start=True, max_iter=1)
model.fit(X_train, y_train)

class FinVaultProfessionalClient(fl.client.NumPyClient):
    def get_parameters(self, config):
        return [model.coef_, model.intercept_]

    def fit(self, parameters, config):
        model.coef_ = np.array(parameters[0])
        model.intercept_ = np.array(parameters[1])
        model.fit(X_train, y_train)
        print(" -> Professional Client completed local optimization cycle.")
        return [model.coef_, model.intercept_], len(X_train), {}

    def evaluate(self, parameters, config):
        model.coef_ = np.array(parameters[0])
        model.intercept_ = np.array(parameters[1])
        loss = 1.0 / model.score(X_test, y_test)
        accuracy = model.score(X_test, y_test)
        return float(loss), len(X_test), {"accuracy": float(accuracy), "loss": float(loss)}

if __name__ == "__main__":
    fl.client.start_client(server_address="127.0.0.1:8080", client=FinVaultProfessionalClient().to_client())