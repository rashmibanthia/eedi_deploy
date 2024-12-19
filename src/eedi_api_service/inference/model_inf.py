from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import os
import json
import transformers
import pandas as pd
import random

from pathlib import Path
from types import SimpleNamespace
from typing import Dict
from transformers import BitsAndBytesConfig
from transformers import AutoModel
import joblib
from tqdm import tqdm
from torch import Tensor
import torch.nn.functional as F
from peft import LoraConfig, get_peft_model


from pathlib import Path
import os


class PathConfig:
    def __init__(self):
        base_dir = Path("/root/cache/data")
        self.is_modal = True

        # if os.environ.get('MODAL_ENVIRONMENT1'):
        #     # Production paths
        #     base_dir = Path("/root/cache/data")
        # else:
        #     # Local development paths
        #     base_dir = Path(__file__).parent.parent.parent.parent / "deploy_assets"

        print("base_dir from model_inf.py") 
        print(base_dir)    
        
        if self.is_modal:
            # Modal paths
            self.base_model_path = "/root/cache/models/base/qwen2.5_14b_instruct"
            self.lora_path = "/root/cache/models/adapters/qwen2.5_14b/eedi-qwen14b-emb-adapter-exp16/adapter.bin"
            self.embeddings_path = "/root/cache/embeddings/qwen2.5_14b_exp16/misconception_embs_qwen14b_exp16.joblib"
            self.train_csv = "/root/cache/data/train_formatted.csv"
            self.mm_csv = "/root/cache/data/misconception_mapping.csv"
        else:
            # Local development paths
            base_dir = Path(__file__).parent.parent.parent.parent
            # print("base_dir from model_inf.py") 
            # print(base_dir) # /home/rashmi/Documents/kaggle/eedi_deploy
            self.base_model_path = str(base_dir / "deploy_assets/qwen2.5-14")
            self.lora_path = str(base_dir / "deploy_assets/qwen2.5-14b-it-lora/lora_weights/adapter.bin")
            self.embeddings_path = str(base_dir / "deploy_assets/misconception_embs_qwen14b_exp16.joblib")
            self.train_csv = str(base_dir / "deploy_assets/train_formatted.csv")
            self.mm_csv = str(base_dir / "deploy_assets/misconception_mapping.csv")


paths = PathConfig()


config = SimpleNamespace()

config.top_k = 101
config.comp_dir  = ""


config.qwen14b_base_model_path = paths.base_model_path
config.qwen14b_lora_path = paths.lora_path 
config.doc_embeddings_path = paths.embeddings_path
TRAIN_FORMATTED_CSV = paths.train_csv
MM_CSV = paths.mm_csv


with open("config.json", "w") as f:
    json.dump(vars(config), f)


###########################################################################
## Load Embedding Model
###########################################################################
base_model_path = config.qwen14b_base_model_path

lora_path = config.qwen14b_lora_path

quantization_config = BitsAndBytesConfig(
                            load_in_4bit=True,
                            bnb_4bit_compute_dtype=torch.float16,
                            bnb_4bit_quant_type="nf4",
                        )

model = AutoModel.from_pretrained(
    base_model_path,
    device_map="auto",
    torch_dtype=torch.float16,
    quantization_config=quantization_config
)

if lora_path:
    print("loading lora")
    l_config = LoraConfig(
            r=64,
            lora_alpha=128,
            target_modules=[
                "q_proj",
                "k_proj",
                "v_proj",
                "o_proj",
                "gate_proj",
                "up_proj",
                "down_proj",
            ],
            bias="none",
            lora_dropout=0.05,  # Conventional
            task_type="FEATURE_EXTRACTION",
        )
    model = get_peft_model(model, l_config)
    d = torch.load(lora_path, map_location=model.device, weights_only=True)
    model.load_state_dict(d, strict=False)

tokenizer = AutoTokenizer.from_pretrained(lora_path.replace("/adapter.bin",""))

def get_model_predictions(input_data):
    df = pd.read_csv(TRAIN_FORMATTED_CSV)
    df = df[df.MisconceptionId!=-1].reset_index(drop=True)
    
    # input_data = {
    #     "question": [df.QuestionText.iloc[0]],
    #     "correct_answer": [df.CorrectAnswerText.iloc[0]],
    #     "incorrect_answer": [df.AnswerText.iloc[0]],
    #     "subject": [df.SubjectName.iloc[0]],
    #     "topic": [df.ConstructName.iloc[0]]
    # }

    input_data1 = {
        "question": [input_data['question']],
        "correct_answer": [input_data['correct_answer']],
        "incorrect_answer": [input_data['incorrect_answer']],
        "subject": [input_data['subject']],
        "topic": [input_data['topic']]
    }

    df = pd.DataFrame(input_data1)
    df.columns = ['QuestionText', 'CorrectAnswerText', 'AnswerText', 'SubjectName', 'ConstructName']
    

    test = df.copy()

    ###########################################################################
    # Format Data
    ###########################################################################
    MAX_LENGTH = 512 

    task_description = 'Given a math question with correct answer and a \
    misconception incorrect answer, retrieve the most accurate misconception for the \
    incorrect answer.'

    test['AllText'] = f'Instruct: {task_description}\nQuery:' + '\n' + \
                        "Construct: " + test['ConstructName'] + '\n' + \
                        "Subject: " + test['SubjectName'] + '\n' + \
                        "Question: " + test['QuestionText'] + '\n' + \
                        "Correct Answer: " + test['CorrectAnswerText'] + '\n' + \
                        "Misconception Incorrect Answer: " + test['AnswerText']  


    print(test['AllText'].loc[0])

    # ###########################################################################
    # ## Load Embedding Model
    # ###########################################################################
   

    embeddings = get_embeddings_in_batches(
        model,
        tokenizer,
        test['AllText'].tolist(),
        max_length=MAX_LENGTH,
        batch_size=4,
    )

    doc_embeddings = joblib.load(config.doc_embeddings_path)

    scores = embeddings @ doc_embeddings.T  # Shape: (M, N)
    sorted_indices = torch.argsort(scores,1, descending=True)[:,:25].tolist()

    test['Top25MisconceptionIds'] = sorted_indices

    return sorted_indices

def analyze_misconception(input_data: Dict) -> Dict:
        """
        Analyze misconceptions from quiz data
        
        Args:
            quiz_data: Dictionary containing:
                - question: str
                - correct_answer: str
                - incorrect_answer: str
                - subject: str
                - construct: str
        """

        mm_df = pd.read_csv(MM_CSV)

        # Format the prompt
        prompt = f"""
        Question: {input_data['question']}
        Correct Answer: {input_data['correct_answer']}
        Student's Answer: {input_data['incorrect_answer']}
        Subject: {input_data['subject']}
        Topic: {input_data['topic']}

        Analyze the student's incorrect answer and identify the potential misconception.
        Explain the misconception and suggest how to address it.
        """

      
        print("Generated Prompt:", prompt)  

        # Assume sorted_indices is calculated elsewhere in the code
        sorted_indices = get_model_predictions(input_data)  # Replace with actual sorted indices logic
        print(sorted_indices)
        # Fetch Misconception Names using sorted indices
        misconception_names = mm_df.loc[sorted_indices[0], 'MisconceptionName'].tolist()

        # Convert misconception names into the expected format
        formatted_misconceptions = [
        {
            "id": idx,
            "title": name,  # Just use the misconception name
            "confidence": 0.95 - (idx * 0.01),  # Keep confidence for ranking
        }
            for idx, name in enumerate(misconception_names, 1)
        ]

        return {
        "analysis": {
            "question_info": {
                "subject": input_data['subject'],
                "topic": input_data['topic'],
                "student_answer": input_data['incorrect_answer']
            },
            "misconceptions": formatted_misconceptions,
            "total_misconceptions": len(formatted_misconceptions)
        }
    }

###########################################################################

def last_token_pool(last_hidden_states: Tensor, attention_mask: Tensor) -> Tensor:
    left_padding = attention_mask[:, -1].sum() == attention_mask.shape[0]
    if left_padding:
        return last_hidden_states[:, -1]
    else:
        sequence_lengths = attention_mask.sum(dim=1) - 1
        batch_size = last_hidden_states.shape[0]
        return last_hidden_states[
            torch.arange(batch_size, device=last_hidden_states.device), sequence_lengths
        ]


def get_embeddings_in_batches(model, tokenizer, texts, max_length, batch_size=32):
    embeddings = []
    for i in tqdm(range(0, len(texts), batch_size), desc="Embedding"):
        batch_texts = texts[i : i + batch_size]
        batch_dict = tokenizer(
            batch_texts,
            max_length=max_length,
            padding=True,
            truncation=True,
            return_tensors="pt",
        ).to("cuda")
        with torch.no_grad(), torch.amp.autocast("cuda"):
            outputs = model(**batch_dict)
            batch_embeddings = last_token_pool(
                outputs.last_hidden_state, batch_dict["attention_mask"]
            )
            batch_embeddings = F.normalize(batch_embeddings, p=2, dim=1).cpu()
        embeddings.append(batch_embeddings)
    return torch.cat(embeddings, dim=0)

###########################################################################

if __name__ == "__main__":
    df = pd.read_csv(TRAIN_FORMATTED_CSV)
    df = df[df.MisconceptionId!=-1].reset_index(drop=True)
    
    input_data = {
        "question": df.QuestionText.iloc[0],
        "correct_answer": df.CorrectAnswerText.iloc[0],
        "incorrect_answer": df.AnswerText.iloc[0],
        "subject": df.SubjectName.iloc[0],
        "topic": df.ConstructName.iloc[0]
    }

    print(analyze_misconception(input_data))
