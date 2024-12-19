# EEDI Deploy

Our deployed app can be found here - https://rashmibanthia--eedi-misconception-analyzer.modal.run

This deployed app is part of our solution (13th Rank) for Kaggle Competition [EEDI](https://www.kaggle.com/competitions/eedi-mining-misconceptions-in-mathematics/).

Our solution summary can be found here - https://www.kaggle.com/competitions/eedi-mining-misconceptions-in-mathematics/discussion/551673


If you want to try an example, here is a sample data - 

```
{'QuestionText': "Tom and Katie are discussing the \\( 5 \\) plants with these heights:\n\\( 24 \\mathrm{~cm}, 17 \\mathrm{~cm}, 42 \\mathrm{~cm}, 26 \\mathrm{~cm}, 13 \\mathrm{~cm} \\)\nTom says if all the plants were cut in half, the range wouldn't change.\nKatie says if all the plants grew by \\( 3 \\mathrm{~cm} \\) each, the range wouldn't change.\nWho do you agree with?",

  'CorrectAnswerText': 'Only\nKatie',

  'IncorrectAnswerText': 'Both Tom and Katie',

  'SubjectName': 'Range and Interquartile Range from a List of Data',

  'ConstructName': 'Calculate the range from a list of data'}
```

Notes:

- This app only deploys 14B Qwen2.5 retriever model on A10G GPU on [Modal](https://modal.com/)
- Deployed using React / FastAPI / Modal for Deployment.
- Most of the frontend is developed using [Cursor](https://cursor.com/)
- Inference is here - `src/eedi_api_service/inference/model_inf.py`


---

To run this following data/models are required:

(1) Lora Adapter fine tuned for Qwen 2.5 14B Instruct Model - Embedding Model

(2) Misconceptions Embeddings from the same fine tuned model

(3) Qwen 2.5 14B Instruct Model - Can be downloaded from [Hugging Face](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct)

(4) Misconception Mapping - Provided by Kaggle - https://www.kaggle.com/competitions/eedi-mining-misconceptions-in-mathematics/data?select=misconception_mapping.csv

(5) `train_formatted.csv` - A sample of this file is provided in `deploy_assets/train_formatted_sample.csv`

---
If you have any questions, please feel free to reach out !



