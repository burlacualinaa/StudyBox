// Layout pentru pagina de login — fără header, footer sau padding
// Aceasta suprascrie root layout doar pentru /login
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
