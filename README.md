# 명운서재

생년월일시를 바탕으로 사주 원국·오행·십성·대운·월운을 계산하고, 계산 근거와
한계를 함께 보여 주는 Next.js/Vinext 서비스입니다.

## 로컬 실행

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

`http://127.0.0.1:3000`에서 접속합니다. 개발 환경에서는 외부 PG 키가 없을 때
서버의 테스트 승인 경로를 사용합니다. 운영 빌드에서는 테스트 결제가 기본적으로
차단됩니다.

## 운영 환경 변수

`.env.example`을 기준으로 배포 환경에 값을 등록하세요. `TOSS_SECRET_KEY`와
`OPENAI_API_KEY`는 브라우저 번들이나 Git 저장소에 넣으면 안 됩니다.

- `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`: 토스페이먼츠 결제창 요청과 서버 승인
- `OPENAI_API_KEY`: 선택 사항. 계산된 명리 데이터를 문장으로 다듬는 데만 사용
- `OPENAI_MODEL`: 기본값 `gpt-5.6-terra`
- `PAYMENT_TEST_MODE`: 운영에서는 반드시 `false`

## 결제·결과 제공 경계

1. `/api/readings`는 무료 원국과 핵심 미리보기만 반환합니다.
2. `/api/payments/prepare`가 서버 고정 금액과 무작위 주문번호를 발급합니다.
3. 토스페이먼츠 인증 후 `/api/payments/confirm`이 주문번호·금액·승인 상태를
   서버에서 검증합니다.
4. 승인이 완료된 요청에만 전체 리포트를 생성해 반환합니다.

현재 구매 결과는 사용자가 선택한 경우 브라우저 저장소에 보관됩니다. 다기기
영구 보관, 계정 복구, 환불 자동화에는 별도 회원 시스템과 데이터베이스 연결이
필요합니다.

## 검증

```bash
npm test
npm run typecheck
npm run check
npm run build
```
