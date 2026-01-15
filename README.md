# drinki-backend-ts

To install dependencies:

```bash
bun install
```

To run:

```bash
# 개발 환경 실행
bun run dev

# 프로덕션 환경 실행
bun run start
```

This project was created using `bun init` in bun v1.3.2. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## 🗄️ Database Setup

### 초기 설정 (처음 한 번만)

```bash
# 1. 스키마에서 SQL 마이그레이션 파일 생성
bunx drizzle-kit generate --config=drizzle.config.ts

# 2. 마이그레이션 실행 (테이블 생성)
bun run src/db/migrate.ts

# 3. 더미 데이터 삽입
bun run src/db/seed.ts
```

### DB 초기화 (Windows PowerShell)

```powershell
# DB 파일 삭제 후 재생성
Remove-Item ./src/db/drinki.db -ErrorAction SilentlyContinue
bunx drizzle-kit generate --config=drizzle.config.ts
bun run src/db/migrate.ts
bun run src/db/seed.ts
```

### DB 초기화 (Mac/Linux)

```bash
# DB 파일 삭제 후 재생성
rm -f ./src/db/drinki.db
bunx drizzle-kit generate --config=drizzle.config.ts
bun run src/db/migrate.ts
bun run src/db/seed.ts
```

### 유용한 명령어

```bash
# DB 브라우저 실행 (테이블/데이터 확인)
bunx drizzle-kit studio --config=drizzle.config.ts

# 스키마 변경 후 마이그레이션 생성
bunx drizzle-kit generate --config=drizzle.config.ts

# 서버 실행
bun run dev
```
