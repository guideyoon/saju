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
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 결제·결과 저장소
- `READING_ENCRYPTION_KEY`: 상세 결과 암호화용 32바이트 Base64 키
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: 브라우저의
  선택적 카카오 로그인

`SUPABASE_SERVICE_ROLE_KEY`는 RLS를 우회할 수 있으므로 서버 환경 변수에만 저장해야
합니다. 브라우저 코드에 넣지 마세요.

## 결제·결과 제공 경계

1. `/api/readings`는 무료 원국과 핵심 미리보기만 반환합니다.
2. `/api/payments/prepare`가 서버 고정 금액과 무작위 주문번호를 발급합니다.
3. 토스페이먼츠 인증 후 `/api/payments/confirm`이 주문번호·금액·승인 상태를
   서버에서 검증합니다.
4. 승인이 완료된 요청에만 전체 리포트를 생성해 반환합니다.
5. 운영 결제 결과는 AES-256-GCM으로 암호화한 뒤 Supabase에 저장하고, 복구 코드는
   해시만 보관합니다.

## Supabase 준비

Supabase SQL Editor 또는 CLI로 아래 마이그레이션을 적용합니다.

```text
supabase/migrations/202607240001_create_myeongun_orders.sql
```

테이블은 RLS를 활성화하고 `anon`, `authenticated` 역할의 직접 접근을 철회합니다.
서버의 결제 승인·복구 API만 서비스 역할 키로 접근합니다. 환경 변수가 하나라도
빠지면 운영 결제는 503으로 차단됩니다.

## 카카오 로그인

Supabase Authentication의 Kakao 공급자를 활성화하고 Kakao Developers에서 발급한
REST API 키와 Client Secret을 Supabase Dashboard에 등록합니다. 리다이렉트 허용
목록에는 운영 도메인의 `/auth/callback`을 추가합니다. 로그인은 선택 사항이며,
로그인하지 않은 구매자는 주문번호와 복구 코드로 결과를 다시 열 수 있습니다.

## 검증

```bash
npm test
npm run typecheck
npm run check
npm run build
```
