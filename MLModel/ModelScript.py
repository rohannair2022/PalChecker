import pandas as pd
from sklearn.ensemble import RandomForestRegressor

import os
import replicate

os.environ["REPLICATE_API_TOKEN"] = "INSERT-TOKEN_HERE"


def regressor_model(x_test):

    reg = RandomForestRegressor()
    data_frame = pd.read_csv('Depression_clean.csv')
    x_test_input = pd.read_csv(x_test)

    x_train = data_frame.iloc[:, :-1]
    y_train = data_frame.iloc[:, -1]

    reg.fit(x_train, y_train)

    replace_map = {1: 0, 2: 0.33, 3: 0.66, 4: 1}
    x_test = x_test_input.replace(replace_map)
    output_model = reg.predict(x_test)

    # The meta/llama-2-70b-chat model can stream output as it's running.
    output_llm = ""
    for event in replicate.stream(
            "meta/llama-2-70b-chat",
            input={
                "debug": False,
                "top_k": 50,
                "top_p": 1,
                "prompt": f'This is for a research to undertsand how a persons day went based of several criterias. Dont provide any explaination. Just give a simple two word answer please.\n\nThe parameters are as follows:\n\n1) How has your sleep been recently?\n2) What would you rate your fatigue levels lately?\n3) Do you tend to feel like you are worthless?\n4) Have you noticed an increase in aggression?\n5) Do you suffer from panic attacks, if so how frequently?\n6) Any drastic changes in appetite?\n\n\nPrompt:\n1,2,2,1,1,2\nOutput:\nNormal\n\nPrompt:\n4,4,4,4,4,4 \nOutput:\nBad Day\n\nPrompt:\n2,3,2,3,2,1\nOutput:\nMedium Day\n\nPrompt:\n{x_test_input.iloc[0].values}\nOutput:',
                "temperature": 0.5,
                "system_prompt": "You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.\n\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.",
                "max_new_tokens": 500,
                "min_new_tokens": -1
            },
    ):
        output_llm += str(event)

    if "Normal Day" in output_llm:
        return (0 + output_model)/2
    elif "Medium Day" in output_llm:
        return (0.5 + output_model)/2
    else:
        return (1 + output_model) / 2


print(regressor_model('Test.csv'))



