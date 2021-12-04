import torch
from transformers import AutoTokenizer, AutoModel
from flask import render_template, request, Flask

global tokenizer 
global model

tokenizer= AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")
model = model.to('cuda')

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]  # First element of model_output contains all token embeddings
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    return sum_embeddings / sum_mask


def get_embeddings(input_sent, prompt, method):
    concat_sent = f'{prompt} {input_sent}'
    print(concat_sent)
    encoded_input = tokenizer(concat_sent, padding=True, truncation=True, max_length=128, return_tensors='pt').to('cuda')

    # Compute token embeddings
    with torch.no_grad():
        model_output = model(**encoded_input)
        sentence_embeddings = mean_pooling(model_output, encoded_input['attention_mask'])
    print(sentence_embeddings.shape)

    return sentence_embeddings


app = Flask(__name__)


@app.route('/')
def home():
    """ This was the test page
    It can be accessed by http://127.0.0.1:5000/
    May not work!!!!!
    """
    return render_template('home.html')


@app.route('/single_sentence', methods=['POST'])
def single_sentence():
    """
    Process single sentence with prompt
    """

    input_sent = request.form['input_sent']
    prompt = request.form['prompt']
    method = request.form['method']

    emb = get_embeddings(input_sent, prompt, method)

    return {'embeddings': emb.cpu().tolist()}

@app.route('/set_model', methods=['POST'])
def set_model():
    """
    Set global PLM
    """
    model_name = request.form['model_name']
    success = False
    if model_name == 'bert':
        tokenizer= AutoTokenizer.from_pretrained("bert-base-uncased")
        model = AutoModel.from_pretrained("bert-base-uncased")
        success = True
    elif model_name == 'roberta':
        tokenizer= AutoTokenizer.from_pretrained("roberta-base")
        model = AutoModel.from_pretrained("roberta-base")
        success = True
    else:
        tokenizer= AutoTokenizer.from_pretrained("bert-base-uncased")
        model = AutoModel.from_pretrained("bert-base-uncased")
    model = model.to('cuda')

    return {'model_name': model_name, 'success': success}

if __name__ == '__main__':
    app.run(debug=True)
