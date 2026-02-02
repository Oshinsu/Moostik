import { PublicNav, PublicFooter } from "@/components/bloodwings";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0b0e] flex flex-col">
      <PublicNav />
      <main className="pt-16 flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
