# Repository for PICOBOX Front-end

- https://picobox.vercel.app/

## 초기 설정

```
# 의존성 설치
npm install

# 실행
npm start
```

## Prettier 설정

- 코드 포맷팅 통일
- vscode extension(Ctrl or Command + Shift + X)에서 Prettier 설치
- 설정(Ctrl or Command + ,)에서 Default Formatter로 Prettier - Code formatter를 선택
- Format On Save 옵션 체크
- 이후 저장할 때마다 formatting이 잘 되는지 확인(세미콜론이 모든 코드 끝에 생성되고 불필요한 공백 등이 사라지게 됨)

## 가이드

- [Notion](https://www.notion.so/20996dfc3df2800882fdd5ff23eb3efe?source=copy_link)에서 새로운 업무 단위마다 티켓을 생성 후, Decription에 어떤 내용인지 작성하기
- 각 티켓의 ID명과 동일한 branch를 생성하기
- 개별 branch에서 작업을 모두 한 뒤, 모든 commit을 push하고 github에서 PR(Pull Request)하기
- 하나의 branch의 내용이 너무 많지 않도록 하기(한 branch에는 하나의 작업을 하도록 하기)
- 새로운 branch를 만들때, main branch에서 git pull 하고 생성하기
- [Commit message convention](https://velog.io/@jiheon/Git-Commit-message-%EA%B7%9C%EC%B9%99)을 따르기
- 주의: **main branch에 절대 push 금지🚫**
