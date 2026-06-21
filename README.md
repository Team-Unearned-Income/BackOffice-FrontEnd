# seoulland_admin_web

# 환경구성

## 커밋 메시지 템플릿 적용

서울랜드 커밋 메시지 가이드라인 파일을 기본 커밋 메시지 템플릿으로 사용할 수 있도록 아래 명령을 실행.

```
git config commit.template .gitmessage
```

## API Generate

### Api 호출 Service 작성에 swagger-typescript-api 으로 Code Generation.

1. B/E server 실행.

2. npm run api-generate

3. src/service/api/generated 폴더에 api service class 가 생성됨.

4. src/service/api/index.ts 에서 instance 를 construct 및 export 하여 사용.

## F/E 실행

npm run dev
