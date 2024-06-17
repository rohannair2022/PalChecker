from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

import os
import replicate

os.environ["REPLICATE_API_TOKEN"] = "r8_Ks3yzdwMEXpS8sdBlzrmg0g1vQqUq8t0oZsDK"


class Model:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(Model, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        reg = RandomForestRegressor()
        data_frame = pd.read_csv('Depression_clean.csv')
        x_train = data_frame.iloc[:, :-1]
        y_train = data_frame.iloc[:, -1]
        reg.fit(x_train, y_train)
        self.model = reg

    def getResponse(self, input_json):
        input_value = pd.DataFrame([input_json])
        replace_map = {1: 0, 2: 0.33, 3: 0.66, 4: 1}
        trimmed_value = input_value.replace(replace_map)
        output_model_score = self.model.predict(trimmed_value)

        output_llm = ""
        for event in replicate.stream(
                "meta/llama-2-70b-chat",
                input={
                    "debug": False,
                    "top_k": 50,
                    "top_p": 1,
                    "prompt": f'This is for a research to undertsand how a persons day went based of several criterias. Dont provide any explaination. Just give a simple two word answer please.\n\nThe parameters are as follows:\n\n1) How has your sleep been recently?\n2) What would you rate your fatigue levels lately?\n3) Do you tend to feel like you are worthless?\n4) Have you noticed an increase in aggression?\n5) Do you suffer from panic attacks, if so how frequently?\n6) Any drastic changes in appetite?\n\n\nPrompt:\n1,2,2,1,1,2\nOutput:\nNormal\n\nPrompt:\n4,4,4,4,4,4 \nOutput:\nBad Day\n\nPrompt:\n2,3,2,3,2,1\nOutput:\nMedium Day\n\nPrompt:\n{trimmed_value.iloc[0].values}\nOutput:',
                    "temperature": 0.5,
                    "system_prompt": "You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.\n\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.",
                    "max_new_tokens": 500,
                    "min_new_tokens": -1
                },
        ):
            output_llm += str(event)

        if "Bad Day" in output_llm:
            return max(0, (0 + output_model_score[0]) / 2)
        elif "Medium Day" in output_llm:
            return max(0.60, (0.5 + output_model_score[0]) / 2)
        elif "Normal Day" in output_llm:
            return max(1, (1 + output_model_score[0]) / 2)
        else:
            return output_model_score[0]


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def _set_response(self, status_code, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        post_data = json.loads(post_data.decode('utf-8'))

        required_keys = ["Sleep_PCA", "Fatigue_PCA", "Worthlessness_PCA", "Aggression_PCA", "Panic Attacks", "Appetite"]

        # Check if any required key is empty
        for key in required_keys:
            if key not in post_data or not post_data[key]:
                self._set_response(400)  # Bad request status code
                self.wfile.write(json.dumps({"error": f"Missing or empty '{key}' in request body"}).encode('utf-8'))
                return

        reordered_data = {
            "Sleep_PCA": post_data["Sleep_PCA"],
            "Fatigue_PCA": post_data["Fatigue_PCA"],
            "Worthlessness_PCA": post_data["Worthlessness_PCA"],
            "Aggression_PCA": post_data["Aggression_PCA"],
            "Appetite": post_data["Appetite"],
            "Panic Attacks": post_data["Panic Attacks"]
        }

        ai = Model()
        result = ai.getResponse(reordered_data) * 100

        response = {
            "score": int(result)
        }

        self._set_response(200)
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'

        file_path = 'public' + self.path
        if os.path.exists(file_path) and not os.path.isdir(file_path):
            ext = os.path.splitext(file_path)[1]
            content_type = 'application/octet-stream'
            if ext == '.html':
                content_type = 'text/html'
            elif ext == '.css':
                content_type = 'text/css'
            elif ext == '.js':
                content_type = 'application/javascript'
            elif ext == '.png':
                content_type = 'image/png'
            elif ext == '.jpg' or ext == '.jpeg':
                content_type = 'image/jpeg'
            elif ext == '.gif':
                content_type = 'image/gif'

            self._set_response(200, content_type)
            with open(file_path, 'rb') as file:
                self.wfile.write(file.read())
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "File not found"}).encode('utf-8'))


def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler, port=3000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd server on port {port}')
    httpd.serve_forever()


if __name__ == '__main__':
    run()
