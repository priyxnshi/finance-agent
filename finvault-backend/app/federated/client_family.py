import flwr as fl
import numpy as np
from sklearn.linear_model import LogisticRegression

# 3. Family Profile Dataset (Large recurring utility transfers and supermarket rows)
X_train = np.array([[450.00, 9], [320.00, 10], [55.30, 16], [14.00, 12], [600.00, 11]])
y_train = np.array([1, 1, 0, 0, 1])

X_test = np.array([[35.00, 15], [250.00, 8]])
y_test = np.array([0, 1])

model = LogisticRegression(warm_start=True, max_iter=1)
model.fit(X_train, y_train)

class FinVaultFamilyClient(fl.client.NumPyClient):
    def get_parameters(self, config):
        return [model.coef_, model.intercept_]

    def fit(self, parameters, config):
        model.coef_ = np.array(parameters[0])
        model.intercept_ = np.array(parameters[1])
        model.fit(X_train, y_train)
        print(" -> Family Node finalized model parameter update matrix pass.")
        return [model.coef_, model.intercept_], len(X_train), {}

    def evaluate(self, parameters, config):
        model.coef_ = np.array(parameters[0])
        model.intercept_ = np.array(parameters[1])
        loss = 1.0 / model.score(X_test, y_test)
        accuracy = model.score(X_test, y_test)
        return float(loss), len(X_test), {"accuracy": float(accuracy), "loss": float(loss)}

if __name__ == "__main__":
    fl.client.start_client(server_address="127.0.0.1:8080", client=FinVaultFamilyClient().to_client())