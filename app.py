import torch
from transformers import AutoTokenizer, AutoModel, AutoModelForMaskedLM
from flask import render_template, request, Flask, Response, jsonify
from datasets import dataset_dict, load_dataset, load_metric
from utils import sst2_preprocess
import umap

global tokenizer 
global model
global dataset
global current_model
global umap_model

current_model = None
model = None
tokenizer = None
dataset = None
umap_model = None

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]  # First element of model_output contains all token embeddings
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    return sum_embeddings / sum_mask

def max_pooling(model_output, attention_mask):
    token_embeddings = model_output[0] #First element of model_output contains all token embeddings
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    token_embeddings[input_mask_expanded == 0] = -1e9  # Set padding tokens to large negative value
    return torch.max(token_embeddings, 1)[0]

def process_dataset(prompt):
    """
        return list of embedding objects (sentence, label, umap, topk, attentions)
    """
    global dataset
    global tokenizer 
    global model
    global umap_model

    # preprocess data
    dataset = dataset.map(sst2_preprocess, fn_kwargs={'tokenizer': tokenizer,'prompt':prompt})
    # print(dataset['example_with_prompt'])
    sentence_list = dataset['example_with_prompt']
    label_list = dataset['label']
    dataset.set_format(type='torch', columns=['input_ids', 'token_type_ids', 'attention_mask', 'mask_position', 'in_len', 'prompt_len'])
    # dataloader
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=20)
    data_list = []
    # Compute token embeddings
    with torch.no_grad():
        for batch in dataloader:
            # to cuda
            batch = {k: v.cuda() for k, v in batch.items()}
            # pop additional data
            mask_position = batch.pop('mask_position')
            in_len = batch.pop('in_len')
            prompt_len = batch.pop('prompt_len')
            # run model
            model_output = model(**batch)
            # get top 10 results
            mask_position=torch.unsqueeze(mask_position, 1)
            mask_position = mask_position.unsqueeze(2).expand(mask_position.size(0), mask_position.size(1), model_output.hidden_states[0].size(2))
            hidden_states = torch.gather(model_output.hidden_states[0], 1, mask_position).squeeze()

            data_list.append(hidden_states.cpu())

    full_hidden_states = torch.cat(data_list)
    umap_model = umap.UMAP().fit(full_hidden_states)
    coords = umap_model.transform(full_hidden_states)

    return sentence_list, label_list, coords



app = Flask(__name__)


@app.route('/')
def home():
    """ This was the test page
    It can be accessed by http://127.0.0.1:5000/
    May not work!!!!! Use postman!!!
    """
    return render_template('home.html')

@app.route('/submit', methods=['POST'])
def submit():
    """
    Process single sentence with prompt
    """
    global dataset
    global tokenizer 
    global model
    global current_model

    dataset_name = request.form['dataset']
    model_name = request.form['model']
    embedding = request.form['embedding']
    prompt = request.form['inputPrompt']


    try:
        dataset = load_dataset('glue', dataset_name, split='validation[:100]')
    except:
        return jsonify({'error':'dataset not found'}), 400

    if model_name != current_model:
        try:
            model = AutoModelForMaskedLM.from_pretrained(model_name, output_hidden_states=True, output_attentions=True)
            model.cuda()
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            current_model = model_name
        except:
            return jsonify({'error':'model not found'}), 400

    sentence_list, label_list, coords = process_dataset(prompt)
    final_list = []
    for sentence, label, coord in zip(sentence_list, label_list, coords):
        final_list.append({'sentence': sentence, 'label':label, 'x': float(coord[0]), 'y': float(coord[1])})

    return jsonify({'embeddings':final_list}), 200


# @app.route('/single_sentence', methods=['POST'])
# def single_sentence():
#     """
#     Process single sentence with prompt
#     """

#     input_sent = request.form['input_sent']
#     prompt = request.form['prompt']
#     method = request.form['method']

#     emb = get_embeddings(input_sent, prompt, method)

#     return {'embeddings': emb.cpu().tolist()}


if __name__ == '__main__':
    app.run(debug=True)
