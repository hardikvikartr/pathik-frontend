"use client";

import Image from "next/image";
import React from "react";

interface Props {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: Props) {
    return (
        <div className="flex h-screen w-full bg-pathik-bg-light overflow-hidden">

            {/* Left Branding Section */}
            {/* <div className="hidden lg:flex lg:w-1/2 bg-linear-to-r from-pathik-primary via-pathik-primary-dark to-pathik-secondary items-center justify-center p-12 text-white">
        <div className="text-center">
          <Image src="/PATHIK_LOGO.png" width={200} height={200} alt="Logo" />
          <p className="mt-4 text-lg opacity-90">
            Program for Analysis of Traveller and Hotel Informatiks
          </p>

          <div className="mt-6 px-5 py-2 border border-white/30 bg-white/10 rounded-full">
            {title}
          </div>
        </div>
      </div> */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-r from-pathik-primary via-pathik-primary-dark to-pathik-secondary items-center justify-center p-12 text-center text-white z-10 transition-all duration-300">
                <div className="absolute inset-0 z-0">
                    <div className="absolute w-[400px] height-[400px] border-50 border-white/5 rounded-full top-[-100px] left-[-100px] animate-[float_6s_ease-in-out_infinite]"></div>
                    <div className="absolute w-[300px] height-[300px] border-30 border-white/5 rounded-full bottom-[-50px] right-[-50px] animate-[float_8s_ease-in-out_infinite_2s]"></div>
                    <div className="absolute w-[150px] height-[150px] border-20 border-white/5 rounded-full top-[20%] right-[20%] animate-[float_7s_ease-in-out_infinite_4s]"></div>
                </div>

                <div className="relative z-10 animate-[scaleIn_0.8s_ease-out_0.2s_both] flex flex-col items-center">
                    <Image
                        src={"/PATHIK_LOGO.png"}
                        width={200}
                        height={200}
                        alt="Pathik Logo"
                        className="mb-4"
                    />
                    <p className="text-[1.1rem] font-light tracking-[1px] opacity-90 max-w-[80%] mx-auto mb-4">
                        Program for Analysis of Traveller and Hotel Informatiks
                    </p>

                    {/* UI IDENTIFIER FOR ROLE */}
                    <div className="mt-4 px-5 py-2 border border-white/30 bg-white/10 backdrop-blur-sm rounded-full animate-[fadeIn_0.5s_ease-out_0.5s_both]">
                        <span className="text-sm font-semibold tracking-wider uppercase">
                            {title}
                        </span>
                    </div>
                </div>
            </div>
            {/* Right Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="bg-white rounded-[24px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-pathik-border transition-all duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                    <h2 className="text-2xl font-bold mb-2">{title}</h2>
                    <p className="text-gray-500 mb-6">{subtitle}</p>

                    {children}
                </div>
            </div>
        </div>
    );
}
 