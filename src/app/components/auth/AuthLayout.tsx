import { Outlet } from "react-router";
import melFullBody from "../../../assets/7db66748f5c4cc52732f3eb047a7125fbfd3d86f.png";
import uniqLogo from "../../../assets/4d0a1198556e8983d1b43af0214800b231b56f73.png";

const phrases = [
  "Gerencie seu negócio com inteligência.",
  "Venda mais. Trabalhe menos. Cresça sempre.",
  "Seu consultor digital trabalhando 24h por você.",
  "Do WhatsApp para o mundo — com a UNIQ.",
];

const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-[48%] xl:w-[44%] flex-col relative overflow-hidden"
        style={{
          background: "#1f2937",
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 p-8 pt-10">
          <img src={uniqLogo} alt="UNIQ Empresas" className="h-12 brightness-0 invert" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-10">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs text-[#86cb92] border border-[#86cb92]/40 bg-[#86cb92]/10 mb-4">
              ✨ Plataforma para Empreendedores
            </span>
            <h1 className="text-white mb-3" style={{ fontSize: "2rem", lineHeight: "1.2" }}>
              O Norte para<br />
              <span style={{ color: "#86cb92" }}>Empreendedores</span>
            </h1>
            <p className="text-[#efefef] text-sm leading-relaxed max-w-xs">
              {randomPhrase}
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: "🚀", text: "Loja virtual pronta em 1 dia" },
              { icon: "🤖", text: "MEL - Seu consultor digital 24h" },
              { icon: "📊", text: "Controle financeiro simplificado" },
              { icon: "📱", text: "Gerencie pelo celular" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[#efefef] text-sm">
                <span className="text-lg">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MEL Character */}
        <div className="absolute bottom-0 right-0 w-[280px] h-[340px] pointer-events-none">
          <img
            src={melFullBody}
            alt="MEL"
            className="w-full h-full object-contain object-bottom"
            style={{
              filter: "drop-shadow(0 10px 30px rgba(31,41,55,0.3))",
            }}
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1f2937] to-transparent" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
