# GRID Project Instructions

## Verification Pipeline (코드 변경 후 필수 검증 단계)

코드 수정 후 사용자에게 브라우저 테스트를 요청하기 **전에** 반드시 아래 순서로 검증:

1. **TypeScript 체크**: `cd app && npx tsc --noEmit`
2. **프로덕션 빌드**: `cd app && npx vite build`
3. **서버 재시작**: node 프로세스 전체 kill → Vite 캐시 삭제(`rm -rf node_modules/.vite`) → `npm run dev`
4. **코드 반영 확인**: `curl -s http://localhost:5173/src/<수정파일경로>` 로 최신 코드 서빙 확인
5. **API 테스트**: curl로 Supabase 엔드포인트 응답 확인 (필요 시)
6. **사용자 확인 요청**: 위 모든 단계 통과 후에만 브라우저 테스트 요청

## Project Structure
- `app/` — Vite + React 19 + TypeScript 프론트엔드
- `supabase/` — DB 스키마, 마이그레이션
- 아키텍처: Clean Architecture (Domain → Application → Infrastructure → Presentation)

## Key Environment Variables
- `VITE_SUPABASE_URL` — Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon public key
- `VITE_DEMO_MODE=true` — Supabase 없이 로컬 데모 모드

## Supabase Info
- Project ref: `aryeyzovzpysnedhvlih`
- Auth: email/password, `mailer_autoconfirm: true`

## Known Issues
- Supabase JS 클라이언트가 브라우저에서 hang되는 현상 발생 (curl은 정상)
- 원인 조사 중: stale localStorage 세션 토큰 또는 클라이언트 초기화 문제 의심
- 현재 `VITE_DEMO_MODE=true`로 우회 중
