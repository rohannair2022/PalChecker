import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA

# Load the dataset
df = pd.read_csv('Depression.csv')


def data_preprocess(data_frame: pd.DataFrame) -> pd.DataFrame:
    # Drop rows with missing values
    data_frame.dropna(inplace=True)

    # Drop 'Number' column if it exists
    if 'Number' in data_frame.columns:
        data_frame.drop('Number', axis=1, inplace=True)

    # Convert int64 and float64 columns to int8
    for column in data_frame.columns:
        if data_frame[column].dtype == 'int64':
            data_frame[column] = data_frame[column].astype('int8')
        elif data_frame[column].dtype == 'float64':
            data_frame[column] = data_frame[column].astype('int8')

    # Replace values according to specified logic
    # Logic Change of Dataset
    # 1-Never, 2- Rarely, Sometimes, 3-Often, 4-Always
    replace_map = {6: 1, 5: 4, 2: 5, 4: 2}
    data_frame.replace(replace_map, inplace=True)

    # Normalize data with MinMaxScaler
    scaler = MinMaxScaler()
    for column in data_frame.columns:
        if column != 'Depression State':
            data_frame[column] = scaler.fit_transform(data_frame[[column]])
            data_frame[column] = data_frame[column].astype('float32')
        else:
            # Map Depression State to numerical values and scale
            # Since it is scaled - 0: Severe, 0.5: Mild Moderate, 1: No depression
            depression_state_map = {'No depression': 3, 'Mild': 2, 'Moderate': 2, 'Severe': 1}
            data_frame['Depression State'] = data_frame['Depression State'].replace(depression_state_map)
            data_frame['Depression State'] = scaler.fit_transform(data_frame[['Depression State']])
            data_frame['Depression State'] = data_frame['Depression State'].astype('float32')

    # Apply PCA to specific groups of columns
    def apply_pca(columns, n_components=1, new_column_name='PCA'):
        pca = PCA(n_components=n_components)
        principal_components = pca.fit_transform(data_frame[columns])
        df_pca = pd.DataFrame(principal_components, columns=[new_column_name])
        return df_pca

    df_sleep = apply_pca(['Sleep', 'Sleep Disturbance'], 1, 'Sleep_PCA')
    df_fatigue = apply_pca(['Fatigue', 'Interest', 'Concentration', 'Low Energy', 'Restlessness'], 1, 'Fatigue_PCA')
    df_worthlessness = apply_pca(['Worthlessness', 'Suicidal Ideation', 'Hopelessness'], 1, 'Worthlessness_PCA')
    df_aggression = apply_pca(['Agitation', 'Aggression'], 1, 'Aggression_PCA')

    # Concatenate PCA results back to the main DataFrame
    data_frame = pd.concat([data_frame, df_sleep, df_fatigue, df_worthlessness, df_aggression], axis=1)

    # Retain only the specified columns
    # Dimension Reduction is now Complete
    retained_columns = ['Sleep_PCA', 'Fatigue_PCA', 'Worthlessness_PCA', 'Aggression_PCA', 'Appetite', 'Panic Attacks', 'Depression State']
    data_frame = data_frame[retained_columns]

    # Scale the PCA columns between 0 and 1 as we dont want negative values.
    for column in data_frame.columns:
        if column != 'Depression State':
            data_frame[column] = scaler.fit_transform(data_frame[[column]])
            data_frame[column] = data_frame[column].astype('float32')

    return data_frame


# Apply preprocessing
new_df = data_preprocess(df)

# Print the DataFrame info and save to CSV
print(new_df.info())
new_df.to_csv('Depression_clean.csv', index=False)
