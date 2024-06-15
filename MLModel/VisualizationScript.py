import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd


data_frame = pd.read_csv('Depression_clean.csv')
corr = data_frame.corr()
plt.figure(figsize=(20,20))


# Corr = Correlation Matrix
# cbar = Legend on the side
# Square = Ensuring square shape
# fmt = Numbers upto one decimal place
# annot = Adds the numbers to each cell
# annot_kws = Text size
# cmap = Color Scheme


sns.heatmap(corr, cbar=True, square= True, fmt='.1f', annot=True, annot_kws={'size': 20}, cmap='Blues')
plt.savefig(f'Visualization_Output_new.png')