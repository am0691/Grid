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

## Design System — Color Token Rules

### Required: Use semantic tokens for all presentation colors
- **Green (success/growth):** `text-growth`, `bg-growth`, `bg-growth-light`
- **Amber/Yellow (warning/stable):** `text-warning`, `bg-warning`, `bg-warning-light`
- **Red (danger/error):** `text-danger`, `bg-danger`, `bg-danger-light`, `text-destructive`, `bg-destructive`
- **Purple/Violet (accent/breakthrough):** `text-accent`, `bg-accent`, `bg-violet-light`
- **Blue (primary/info):** `text-primary`, `bg-primary`, `bg-primary/10`
- **Gray (muted):** `text-muted-foreground`, `bg-muted`, `bg-secondary`

### Prohibited in presentation layer
- Hardcoded Tailwind colors: `bg-green-*`, `text-blue-*`, `border-red-*`, etc.
- Hardcoded hex in className or inline style (except data-driven area colors from domain layer)
- Exception: `types/index.ts`, `domain/` hex colors are data definitions, not presentation

### Where hex colors are OK
- Domain layer data definitions (`area.ts`, `pastoral-log.ts`, `crisis-detection.service.ts`)
- Recharts `stroke`/`fill` attributes (requires raw values)
- Inline `style` for data-driven area colors from backend

### Reference
- Full design system: `.interface-design/system.md`
- CSS variables: `app/src/index.css`
- Tailwind tokens: `app/tailwind.config.js`

## Known Issues
- Supabase JS 클라이언트가 브라우저에서 hang되는 현상 발생 (curl은 정상)
- 원인 조사 중: stale localStorage 세션 토큰 또는 클라이언트 초기화 문제 의심
- 현재 `VITE_DEMO_MODE=true`로 우회 중
