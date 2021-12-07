# Files for preprocessors

def sst2_preprocess(example, tokenizer, prompt):
    in_len = len(tokenizer.tokenize(example['sentence']))
    prompt_len = len(tokenizer.tokenize(prompt))
    # data for PLM
    example_with_prompt = f'{example["sentence"]} {prompt}'
    encoded_input = tokenizer(example_with_prompt, truncation=True, max_length=128, padding='max_length')

    # additional data
    encoded_input['mask_position'] = encoded_input['input_ids'].index(tokenizer.mask_token_id)
    encoded_input['in_len'] = in_len
    encoded_input['prompt_len'] = prompt_len
    encoded_input['example_with_prompt'] = example_with_prompt

    return encoded_input
