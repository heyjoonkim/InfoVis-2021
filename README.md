# Visualization for Interpretability of Pretrained Language Model

## 2021 InfoVis Final Project

### Installation
```
yarn add d3
yarn add react-select
yarn add material-table @material-ui/core
yarn add axios
```

### start
```
yarn start
```

## API (서버에서 처리할 때 참고해주세요)

1. "Change Settings" button을 눌렀을 때 : localhost/options (POST 요청)
    - Sample Dataset (임시) : "SST-2", "RTE"
    - Model (임시) : "bert-base-cased", "albert-xxlarge-v2"
    - Embedding method (임시) : "mask", "cls", "mean", "max"
    ```
    # API 예시
    {
      "dataset" : "SST-2",
      "model" : "bert-base-cased",
      "embedding" : "mask"
    }
    ```
2. "Apply" button을 눌렀을 때 : localhost/apply (POST 요청)

    - 
    ```
    # API 예시
    {
      
    }
    ```
---

## 현재 상태
- 2021 / 11 / 29 (월)
![image](https://user-images.githubusercontent.com/29649894/143819563-3737c1a8-2042-4a84-9fed-c3d0384c5c6c.png)
  - TODO
    - 아직 Attention map 시각화하는 부분 완벽하게 가져오지 못함. 
     - 이 부분은 입력 문장의 길이가 매번 바뀔 수 있다는 점을 고려해서 추가적으로 수정이 필요할 듯
     - 화면 크기에 맞게 재조정이 필요함.
    - ControlPlot (dataset, model, embedding 지정하는 부분) 마지막에 지정 사항 submit 하는 버튼 -> submit하면 서버로 정보 보내서 다시 값 받아오기.
    - 중간 발표 때 피드백 받은 내용 : scatter plot에 있는 점들을 지정해서, 지정한 문장들만 따로 표에 보여주기?
    - 사용자 지정 문장 / Prompt 를 서버로 보내서 값 받아오는 로직 구현.
    - 화면에 뿌려줄 때 필요한 데이터를 서버에서 불러오는 로직 구현.
    - UI 좀 보기좋게 꾸미기 (안해도 됨)
    - Flask 서버 구현
