from __future__ import print_function
from flask import Flask, render_template, make_response
from flask import redirect, request, jsonify, url_for
from flask import after_this_request
from test_template import generate_test_information

import io
import os
import uuid

app = Flask(__name__)
app.secret_key = 's3cr3t'
app.debug = True
app._static_folder = os.path.abspath("templates/static/")

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/testGenerate', methods = ['POST'])
def get_post_javascript_data():
    
    jsdata= request.form.to_dict()
    return jsonify(jsdata)

@app.route('/getData', methods = ['GET'])
def get_data():
    
    jsonResp = generate_test_information('ecuacion')
    return jsonify(jsonResp)

if __name__ == '__main__':
    app.run()


""" @app.route('/hello2', methods=['POST'])
def hello():

    @after_this_request
    def add_header(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    #jsdata = request.form['saludo']
    jsonResp = {'jack': 4098, 'sape': 4139}
    #jsonResp = jsdata
    print(jsonify(jsonResp))
    return jsonify(jsonResp) """