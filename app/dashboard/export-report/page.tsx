"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ExportReportPage() {
    const router = useRouter();
    const [checkinStart, setCheckinStart] = useState("");
    const [checkoutEnd, setCheckoutEnd] = useState("");
    const [exportType, setExportType] = useState("pdf");
    const [isExporting, setIsExporting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!checkinStart) {
            alert('Please select a checkin date start.');
            return;
        }

        setIsExporting(true);

        // Simulate API call
        setTimeout(() => {
            alert(`Export initiated!\n\nCheckin Start: ${checkinStart}\nCheckout End: ${checkoutEnd || 'Not specified'}\nExport Type: ${exportType.toUpperCase()}\n\nThis is a demo. In production, this would download the report.`);
            setIsExporting(false);
        }, 1500);
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-8 max-w-[1200px] mx-auto animate-[fadeInUp_0.6s_ease-out]">
            <div className="w-full max-w-[600px] relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-[60px] animate-[float_6s_ease-in-out_infinite] z-0"></div>
                <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-[60px] animate-[float_6s_ease-in-out_infinite_2s] z-0"></div>
                
                {/* Export Card */}
                <div className="bg-white rounded-[24px] p-12 shadow-[0_10px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] relative z-10 border border-indigo-100 transition-all duration-300 hover:shadow-[0_15px_50px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 animate-[scaleIn_0.8s_ease-out_0.2s_both]">
                    <div className="text-center mb-10 relative">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pathik-primary to-pathik-secondary rounded-[20px] flex items-center justify-center shadow-[0_8px_24px_rgba(102,126,234,0.3)] animate-[pulse_2s_ease-in-out_infinite]">
                            <i className="fas fa-file-export text-white text-3xl"></i>
                        </div>
                        <h1 className="text-3xl font-bold text-pathik-text-dark mb-2 tracking-tight">Export Guest Data</h1>
                        <p className="text-pathik-text-light text-sm font-normal">Generate comprehensive reports for your guest data</p>
                    </div>
                    
                    <form className="mt-8" onSubmit={handleSubmit}>
                        {/* Checkin Date Start */}
                        <div className="mb-8 relative">
                            <label className="block text-sm font-semibold text-pathik-text-dark mb-3 tracking-wide">
                                Checkin Date Start <span className="text-pathik-coral ml-1 font-bold">*</span>
                            </label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    className="w-full py-3.5 px-4 pl-12 border-2 border-pathik-border rounded-xl text-sm text-pathik-text-dark bg-white transition-all duration-300 focus:outline-none focus:border-pathik-primary focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] placeholder:text-pathik-text-light/60" 
                                    value={checkinStart}
                                    onChange={(e) => setCheckinStart(e.target.value)}
                                    placeholder="Enter Checkin Date Start"
                                    required
                                />
                                <i className="fas fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-pathik-text-light text-base pointer-events-none transition-colors duration-300"></i>
                            </div>
                        </div>
                        
                        {/* Checkout Date End */}
                        <div className="mb-8 relative">
                            <label className="block text-sm font-semibold text-pathik-text-dark mb-3 tracking-wide">Checkout Date End</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    className="w-full py-3.5 px-4 pl-12 border-2 border-pathik-border rounded-xl text-sm text-pathik-text-dark bg-white transition-all duration-300 focus:outline-none focus:border-pathik-primary focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] placeholder:text-pathik-text-light/60" 
                                    value={checkoutEnd}
                                    onChange={(e) => setCheckoutEnd(e.target.value)}
                                    placeholder="Enter Checkout Date End"
                                />
                                <i className="fas fa-calendar-check absolute left-4 top-1/2 -translate-y-1/2 text-pathik-text-light text-base pointer-events-none transition-colors duration-300"></i>
                            </div>
                        </div>
                        
                        {/* Export Type */}
                        <div className="mb-8 relative">
                            <label className="block text-sm font-semibold text-pathik-text-dark mb-3 tracking-wide">Export Type</label>
                            <div className="flex gap-6 mt-3 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 min-w-[120px]">
                                    <input 
                                        type="radio" 
                                        id="pathikExportPDF" 
                                        name="pathikExportType" 
                                        value="pdf"
                                        className="absolute opacity-0 w-0 h-0 peer"
                                        checked={exportType === "pdf"}
                                        onChange={(e) => setExportType(e.target.value)}
                                    />
                                    <label htmlFor="pathikExportPDF" className="flex items-center gap-3 p-4 px-5 border-2 border-pathik-border rounded-xl cursor-pointer transition-all duration-300 bg-white font-medium text-pathik-text-dark relative overflow-hidden peer-checked:border-pathik-primary peer-checked:bg-indigo-50/50 peer-checked:text-pathik-primary hover:border-indigo-300 hover:-translate-y-0.5 hover:shadow-md">
                                        <span className="w-5 h-5 border-2 border-pathik-border rounded-full flex items-center justify-center transition-all duration-300 shrink-0 peer-checked:border-pathik-primary peer-checked:bg-pathik-primary peer-checked:shadow-[0_0_0_4px_rgba(102,126,234,0.2)] before:content-[''] before:w-2 before:h-2 before:bg-white before:rounded-full before:scale-0 peer-checked:before:scale-100 before:transition-transform"></span>
                                        <span>PDF</span>
                                    </label>
                                </div>
                                <div className="relative flex-1 min-w-[120px]">
                                    <input 
                                        type="radio" 
                                        id="pathikExportCSV" 
                                        name="pathikExportType" 
                                        value="csv"
                                        className="absolute opacity-0 w-0 h-0 peer"
                                        checked={exportType === "csv"}
                                        onChange={(e) => setExportType(e.target.value)}
                                    />
                                    <label htmlFor="pathikExportCSV" className="flex items-center gap-3 p-4 px-5 border-2 border-pathik-border rounded-xl cursor-pointer transition-all duration-300 bg-white font-medium text-pathik-text-dark relative overflow-hidden peer-checked:border-pathik-primary peer-checked:bg-indigo-50/50 peer-checked:text-pathik-primary hover:border-indigo-300 hover:-translate-y-0.5 hover:shadow-md">
                                        <span className="w-5 h-5 border-2 border-pathik-border rounded-full flex items-center justify-center transition-all duration-300 shrink-0 peer-checked:border-pathik-primary peer-checked:bg-pathik-primary peer-checked:shadow-[0_0_0_4px_rgba(102,126,234,0.2)] before:content-[''] before:w-2 before:h-2 before:bg-white before:rounded-full before:scale-0 peer-checked:before:scale-100 before:transition-transform"></span>
                                        <span>CSV</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        {/* Button Group */}
                        <div className="flex gap-4 mt-10 flex-wrap sm:flex-nowrap">
                            <button 
                                type="submit" 
                                className="flex-1 min-w-[150px] p-4 px-8 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-br from-pathik-primary to-pathik-secondary text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <span>Exporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-download"></i>
                                        <span>Export Report</span>
                                    </>
                                )}
                            </button>
                            <button 
                                type="button" 
                                className="flex-1 min-w-[150px] p-4 px-8 border-2 border-pathik-border rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-white text-pathik-text-dark hover:bg-pathik-bg-light hover:border-pathik-text-light hover:-translate-y-0.5"
                                onClick={() => router.back()}
                            >
                                <i className="fas fa-times"></i>
                                <span>Cancel</span>
                            </button>
                        </div>
                    </form>
                    
                    {/* Footer */}
                    <div className="text-right py-4 mt-8 text-pathik-text-light text-sm border-t border-pathik-border pt-6"></div>
                </div>
            </div>
        </div>
    );
}
