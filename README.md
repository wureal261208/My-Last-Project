# The Final Book Project

Project chính hiện tại là Next.js 15 ở root folder. Frontend React cũ đã được migrate sang `src/legacy` và render qua Next App Router.

## Chạy project

```bash
npm.cmd run dev
```

Mở:

```txt
http://localhost:3000
```

## Cấu trúc quan trọng

- `src/app/page.tsx`: route chính của Next.js.
- `src/components/legacy-book-app.tsx`: wrapper client để chạy frontend cũ trong Next.
- `src/legacy`: toàn bộ UI/frontend cũ được giữ lại trong Next.js.
- `public/logo.jpg`: logo dùng chung cho app.
- `public/hero.png`: hero image dùng chung cho app.
- `src/lib/firebase/client.ts`: Firebase client config dùng chung.
- `src/lib/firebase/admin.ts`: Firebase Admin SDK cho server-side.

## Ghi chú

App chính để deploy Vercel là root project Next.js. Project cũ đã được dọn để tránh nhầm lẫn khi deploy.
