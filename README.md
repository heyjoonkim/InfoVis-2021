# Visualization for Interpretability of Pretrained Language Model

## 2021 InfoVis Final Project

### Installation
- 다음 명령어를 이용해서 실행에 필요한 라이브러리를 설치합니다.
```
yarn add d3
yarn add react-select
yarn add material-table @material-ui/core
yarn add axios
```

### 실행 방법
- 위 라이브러리를 모두 추가한 후 다음 명령어를 실행시킵니다.
```
yarn start
```

### 사용 방법
1. 처음 화면이 로드되면, 사전에 지정한 모델 (BERT-base-cased) 와 데이터셋 (SST-2) 그리고 임베딩 방식([MASK])에 대한 정보를 출력합니다.
    - 첫 화면에는 데이터셋 목록, 각 데이터셋을 구성하는 문장들의 representation을 embedding space에 출력합니다.
2. 표에 표시된 문장을 클릭하면, 해당 문장의 embedding이 embedding space에서 어디에 위치하는지 표시가되고 나머지 값들은 blur 처리 됩니다.
    - 선택한 문장을 다시 클릭하면 처음 상태로 돌아갑니다.
3. 문장을 선택하면, 해당 문장에 대한 TOP-10 prediction 정보와, attention map을 화면 하단에서 확인할 수 있습니다.
4. Attention map의 경우, 원하는 Layer를 지정해서, 해당 Layer의 attention map을 확인할 수 있습니다.
5. 새로운 데이터셋을 확인하기 위해서는 우측의 Dataset을 변경 후 [Apply Filter] 를 클릭하면 됩니다.
6. 새로운 모델의 임베딩을 확인하기 위해서는 우측의 Model을 변경 후 [Apply Filter] 를 클릭하면 됩니다.
7. 새로운 임베딩 방식을 사용하기 위해서는 우측의 Embedding을 변경 후 [Apply Filter] 를 클릭하면 됩니다.
8. 새로운 Prompt를 적용하기 위해서는 우측의 Prompt를 새로 입력 후 [Apply Filter] 를 클릭하면 됩니다.
    - <b>[중요!!!] bert-base-cased를 사용하는 경우 <code>[MASK]</code>, roberta-base를 사용하는 경우는 <code>	&lt;mask&gt;</code> 를 prompt에 반드시!!! 추가해주셔야 합니다. </b>
10. 5~8번의 필터는 모두 동시에 적용이 가능합니다.
11. 사용자가 지정한 문장을 함께 적용하기 위해서는 우측의 Input Sentence를 입력 후 [Submit New Sentence]를 클릭하면 됩니다.


### 주의 사항
- 처음으로 화면을 로딩하는 경우, 서버에 요청을 보내 모델을 로딩하고 데이터를 처리 후 리턴해주는 과정이 실행되기 때문에, 첫 화면이 보여지는데 조금 시간이 걸릴 수 있습니다.
- Apply filter 버튼을 눌러더 전체 조건을 바꿔주는 경우, 새로운 모델을 로드하거나 데이터를 다시 처리하는 과정이 동반되기 때문에 새로운 데이터가 화면에 나타는데 조금 시간이 걸릴 수 있습니다.
