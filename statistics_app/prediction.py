from sklearn.linear_model import LinearRegression
import numpy as np


def predict_workshops(monthly_counts):

    X = np.arange(len(monthly_counts)).reshape(-1,1)
    y = np.array(monthly_counts)

    model = LinearRegression()
    model.fit(X,y)

    future_months = np.arange(len(monthly_counts), len(monthly_counts)+3).reshape(-1,1)

    predictions = model.predict(future_months)

    return predictions.tolist()