import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-pathik-bg-light flex flex-col relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pathik-primary/5 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pathik-secondary/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <Image
            src="/PATHIK_LOGO.png"
            alt="Pathik Logo"
            width={50}
            height={50}
            className="w-12 h-12"
          />
          <div>
            <h1 className="text-2xl font-bold text-pathik-primary tracking-tight">
              PATHIK
            </h1>
            <p className="text-[0.65rem] text-gray-500 uppercase tracking-widest font-semibold">
              Security & Surveillance
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-[fadeIn_0.5s_ease-out]">
          <h2 className="text-4xl md:text-5xl font-bold text-pathik-text-dark mb-6 leading-tight">
            Intelligent Hotel{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-pathik-primary to-pathik-secondary">
              Guest Analysis
            </span>{" "}
            System
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Program for Analysis of Traveller and Hotel Informatiks. <br />
            Secure, efficient, and real-time monitoring for safer communities.
          </p>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
          <Link href="/hotel" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-pathik-primary/20 h-full flex flex-col items-center text-center cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-pathik-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-hotel text-3xl text-pathik-primary"></i>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Hotel Partners
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Guest registration, record maintenance, and compliance reporting
                portal.
              </p>

              <span className="mt-auto px-6 py-2 bg-white border border-pathik-primary text-pathik-primary rounded-full text-sm font-semibold group-hover:bg-pathik-primary group-hover:text-white transition-all">
                Login as Hotel
              </span>
            </div>
          </Link>
          <Link href="/police" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-pathik-secondary/20 h-full flex flex-col items-center text-center cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-pathik-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-user-shield text-3xl text-pathik-secondary"></i>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Police Stations
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Surveillance, verification, and analysis dashboard for law
                enforcement.
              </p>

              <span className="mt-auto px-6 py-2 bg-white border border-pathik-secondary text-pathik-secondary rounded-full text-sm font-semibold group-hover:bg-pathik-secondary group-hover:text-white transition-all">
                Login as Police
              </span>
            </div>
          </Link>
        </div> */}
      </main>

      <footer className="w-full text-center py-6 text-gray-400 text-sm relative z-10">
        &copy; {new Date().getFullYear()} Pathik System. All Rights Reserved.
      </footer>
    </div>
  );
}
