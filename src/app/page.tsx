export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-12">
      <p className="mb-3 text-sm font-medium text-muted-foreground">Next.js 15 + Firebase</p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
        The Final Book Project
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
        Nền tảng đọc và bán sách điện tử. Phần 1 đã thiết lập project, Tailwind, Firebase client,
        Firebase Admin và cấu trúc nền để tiếp tục xây Auth + Role Guard.
      </p>
    </main>
  );
}
