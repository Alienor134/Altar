
import numpy as np
import matplotlib.pyplot as plt

from sacred import Experiment
from ingredient_save_folder import save_folder, make_folder

from sacred.observers import MongoObserver


ex = Experiment('test_experiment', ingredients=[save_folder])

ex.observers.append(MongoObserver(url='mongodb://localhost:27017/',
                                  db_name='test_db'))



@ex.config
def my_config():
    A = 10
    tau = 0.5
    B = 3
    N = 100

@ex.automain
def my_main(_run, A, tau, B, N):

    save_folder =  make_folder(_run, root = "")

    x = np.linspace(0, 1, N)

    y = A * np.exp(-tau * x) + B

    plt.plot(x, y)
    plt.xlabel('time')
    plt.ylabel('y')
    plt.savefig(save_folder + '/output_plot.png')

    ex.add_artifact(save_folder + '/output_plot.png', name='output_plot.png')

    for i in range(N):
        _run.log_scalar("y", y[i], x[i])


    