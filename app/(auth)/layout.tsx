export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#060a12] flex items-center justify-center p-4"
      style={{
        backgroundImage: [
          "radial-gradient(ellipse at 65% 0%, rgba(16,185,129,0.10) 0%, transparent 55%)",
          "radial-gradient(ellipse at 5%  85%, rgba(6,182,212,0.07)  0%, transparent 50%)",
          "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.03) 0%, transparent 70%)",
        ].join(", "),
      }}
    >
      {children}
    </div>
  );
}
