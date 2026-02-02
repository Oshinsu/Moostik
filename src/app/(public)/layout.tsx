import { PublicNav } from "@/components/bloodwings";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0b0e]">
      <PublicNav />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
