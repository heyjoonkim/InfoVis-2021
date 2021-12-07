import torch
from transformers import AutoTokenizer, AutoModel, AutoModelForMaskedLM
from flask import render_template, request, Flask, Response, jsonify
from datasets import dataset_dict, load_dataset, load_metric
from utils import sst2_preprocess
import umap
from flask_cors import CORS, cross_origin


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

model = AutoModelForMaskedLM.from_pretrained('bert-base-uncased', output_hidden_states=True, output_attentions=True)
model.cuda()
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
current_model = 'bert-base-uncased'

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

def process_sentence(input_sentence, prompt):
    """
        return list of embedding objects (sentence, label, umap, topk, attentions)
    """
    global tokenizer 
    global model
    global umap_model

    # preprocess data
    new_sentence = f'{input_sentence} {prompt}'
    encoded_input = tokenizer(new_sentence, truncation=True, max_length=128, padding='max_length', return_tensors='pt')
    mask_position = (encoded_input['input_ids'][0] == tokenizer.mask_token_id).nonzero(as_tuple=True)[0][0]

    # Compute token embeddings
    with torch.no_grad():
        # run model
        encoded_input = {k: v.cuda() for k, v in encoded_input.items()}
        model_output = model(**encoded_input)
        hidden_state = model_output.hidden_states[0][0][mask_position]

    hidden_state = hidden_state.cpu()
    hidden_state = hidden_state.unsqueeze(0)
    coords = umap_model.transform(hidden_state)

    # 100 label for no label
    return new_sentence, 100, coords[0]

def sentence_prediction(input_sentence, prompt):
    """
        return list of embedding objects (sentence, label, umap, topk, attentions)
    """
    global tokenizer 
    global model

    # preprocess data
    new_sentence = f'{input_sentence} {prompt}'
    encoded_input = tokenizer(new_sentence, truncation=True, max_length=128, padding='max_length', return_tensors='pt')
    mask_position = (encoded_input['input_ids'][0] == tokenizer.mask_token_id).nonzero(as_tuple=True)[0][0]

    # Compute token embeddings
    with torch.no_grad():
        # run model
        encoded_input = {k: v.cuda() for k, v in encoded_input.items()}
        model_output = model(**encoded_input)

        # top 10
        logits = model_output.logits
        mask_logit = logits[0][mask_position]
        sm = torch.nn.Softmax(dim=0)
        probs = sm(mask_logit)
        tk = torch.topk(probs,10,0)
        topk_list = []
        for prob, ids in zip(tk.values.cpu(), tk.indices.cpu()):
            topk_list.append({tokenizer.decode(ids): float(prob)})

        # mean attention
        attentions = model_output.attentions
        attentions = [l[0].mean(dim=0).cpu() for l in attentions]

    input_tokens = tokenizer.tokenize(input_sentence)
    prompt_tokens = tokenizer.tokenize(prompt)

    return topk_list, attentions, input_tokens, prompt_tokens


app = Flask(__name__)
CORS(app)

@app.route('/')
def healthcheck():
    """ 
        healthcheck!!
    """
    return jsonify({'healthcheck':'success'}), 200


@app.route('/submit', methods=['POST'])
def submit():
    """
    Process dataset with prompt
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


@app.route('/input_sentence', methods=['POST'])
def input_sentence():
    """
    Process single sentence with prompt
    """

    input_sentence = request.form['inputSentence']
    prompt = request.form['inputPrompt']
    embedding = request.form['embedding']

    sentence, label, coord = process_sentence(input_sentence, prompt)
    
    return jsonify({'embeddings':{'sentence': sentence, 'label':label, 'x': float(coord[0]), 'y': float(coord[1])}}), 200


@app.route('/sentence_detail', methods=['POST'])
def sentence_detail():
    """
    Process single sentence with prompt
    """

    input_sentence = request.form['sentence']
    prompt = request.form['prompt']

    topk_list, attentions, input_tokens, prompt_tokens = sentence_prediction(input_sentence, prompt)
    input_len = len(input_tokens)
    prompt_len = len(prompt_tokens)
    attention_results = {"input_tokens": input_tokens, "prompt_tokens": prompt_tokens, "num_layer": len(attentions)}

    for idx, l in enumerate(attentions):
        layer_attentions = []
        for input_pos in range(input_len):
            for prompt_pos in range(prompt_len):
                layer_attentions.append({"input_pos":input_pos, 'prompt_pos':prompt_pos, "attn_value": float(l[input_pos][input_pos+prompt_pos])})
        attention_results[str(idx)] = layer_attentions

    return jsonify({'topk': topk_list, 'attentions': attention_results}), 200


if __name__ == '__main__':
    app.run(debug=True)
