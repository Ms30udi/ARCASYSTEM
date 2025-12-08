import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Shield, FileText } from 'lucide-react'
import { Scale, FileSearch, Download, CheckCircle } from 'lucide-react'


function Landing() {
    const navigate = useNavigate()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const handleStartAnalysis = () => {
        navigate('/analysis')
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#e6dfd7' }}>
            {/* Header */}
            <header className="flex justify-between items-center px-12 py-6">
                <div
                    className="transition-all duration-1000 ease-out"
                    style={{
                        opacity: isLoaded ? 1 : 0,
                        transform: isLoaded ? 'translateX(0)' : 'translateX(-50px)'
                    }}
                >
                    <img
                        src="/images/lexia_Logo.png"
                        alt="Lexia Logo"
                        className="ml-10 h-20 transition-transform duration-500 ease-in-out cursor-pointer"
                        style={{ transformStyle: 'preserve-3d' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(45deg)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'}
                    />
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={handleStartAnalysis}
                        className="flex items-center gap-2 px-6 py-2 border-2 border-black rounded-full transition-all duration-300 hover:bg-black hover:text-white cursor-pointer group"
                        style={{
                            fontFamily: "'Cooper BT', serif",
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateY(0)' : 'translateY(-30px)',
                            transition: 'all 1s ease-out 0.3s'
                        }}
                    >
                        <img
                            src="/images/lexia_icon.png"
                            alt="Icon"
                            className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12"
                        />
                        <span className="group-hover:text-white">START ANALYSIS</span>
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex items-center px-12 py-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-7xl mx-auto">
                    {/* Left Content */}
                    <div
                        className="flex flex-col justify-center space-y-8 transition-all duration-1000 ease-out"
                        style={{
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateX(0)' : 'translateX(-100px)',
                            transitionDelay: '0.2s'
                        }}
                    >
                        <div>
                            <h1
                                className="text-7xl font-bold leading-tight mb-0"
                                style={{ fontFamily: "'Cooper BT', serif" }}
                            >
                                <span className="text-black">Autonomous</span>
                                <br />
                                <span style={{ color: '#c1a673' }}>Compliance</span>
                                <br />
                                <span className="text-black">Agent.</span>
                            </h1>
                        </div>

                        <div className="space-y-0">
                            <p
                                className="text-xl leading-relaxed text-gray-700"
                                style={{ fontFamily: "'Cooper BT', serif" }}
                            >
                                AI agents analyze regulation, detect policy conflicts.
                            </p>
                            <p
                                className="text-xl leading-relaxed text-gray-700"
                                style={{ fontFamily: "'Cooper BT', serif" }}
                            >
                                And generate clear compliance reports.
                            </p>
                        </div>

                        <button
                            onClick={handleStartAnalysis}
                            className="flex items-center gap-3 w-fit px-10 py-4 bg-black rounded-full shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl group"
                        >
                            <img
                                src="/images/lexia_icon.png"
                                alt="Icon"
                                className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12"
                            />
                            <span
                                style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }}
                                className="text-xl font-semibold"
                            >
                                START ANALYSIS
                            </span>
                        </button>
                    </div>

                    {/* Right Content - Hero Image */}
                    <div
                        className="flex items-start justify-center transition-all duration-1000 ease-out pt-0"
                        style={{
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateX(0)' : 'translateX(100px)',
                            transitionDelay: '0.4s'
                        }}
                    >
                        <img
                            src="/images/hero_pic1.png"
                            alt="AI Robot with Justice Scales"
                            className="w-full max-w-2xl object-contain drop-shadow-2xl"
                            style={{ marginTop: '-44px' }}
                        />
                    </div>

                </div>
            </section>

            {/* Performance Metrics Section */}
            <section
                className="py-20 px-12"
                style={{ backgroundColor: '#f5f0ea' }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <p
                            className="text-sm tracking-widest mb-4"
                            style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }}
                        >
                            SYSTEM PERFORMANCE
                        </p>
                        <h2
                            className="text-5xl font-bold text-black"
                            style={{ fontFamily: "'Cooper BT', serif" }}
                        >
                            Engineered for Speed.
                        </h2>
                        <p className="text-gray-600 mt-4 text-lg">
                            Our proprietary vector engine processes thousands of regulation pages per second.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
                        <div className="text-center">
                            <div
                                className="text-6xl font-bold mb-2"
                                style={{ fontFamily: "'Cooper BT', serif" }}
                            >
                                99.8%
                            </div>
                            <div
                                className="text-sm tracking-wider"
                                style={{ color: '#c1a673' }}
                            >
                                ACCURACY
                            </div>
                        </div>
                        <div className="text-center">
                            <div
                                className="text-6xl font-bold mb-2"
                                style={{ fontFamily: "'Cooper BT', serif" }}
                            >
                                &lt;0.5s
                            </div>
                            <div
                                className="text-sm tracking-wider"
                                style={{ color: '#c1a673' }}
                            >
                                LATENCY
                            </div>
                        </div>
                        <div className="text-center">
                            <div
                                className="text-6xl font-bold mb-2"
                                style={{ fontFamily: "'Cooper BT', serif" }}
                            >
                                24/7
                            </div>
                            <div
                                className="text-sm tracking-wider"
                                style={{ color: '#c1a673' }}
                            >
                                UPTIME
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section
                className="py-16 px-12"
                style={{ backgroundColor: '#e6dfd7' }}
            >
                <div className="max-w-4xl mx-auto text-center">
                    <h2
                        className="text-5xl font-bold mb-12"
                        style={{ fontFamily: "'Cooper BT', serif" }}
                    >
                        Ready to Optimize?
                    </h2>
                    <button
                        onClick={handleStartAnalysis}
                        className="inline-flex items-center gap-3 px-12 py-4 bg-black text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
                    >
                        <img
                            src="/images/lexia_icon.png"
                            alt="Icon"
                            className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12"
                        />
                        <span
                            className="text-lg"
                            style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }}
                        >
                            INITIALIZE SYSTEM
                        </span>
                    </button>
                </div>
            </section>

            {/* Mission Section */}
            <section
                className="py-28 px-12"
                style={{ backgroundColor: '#1a1a1a' }}
            >
                <div className="max-w-6xl mx-auto text-center">
                    <p
                        className="text-sm tracking-widest mb-6"
                        style={{ color: '#c1a673' }}
                    >
                        OUR MISSION
                    </p>
                    <h2
                        className="text-6xl font-bold mb-8"
                        style={{ fontFamily: "'Cooper BT', serif", color: 'white' }}
                    >
                        Redefining the <span style={{ color: '#c1a673' }}>Language</span> of Law.
                    </h2>
                    <p className="text-gray-300 text-xl max-w-4xl mx-auto leading-relaxed">
                        We build intelligence that bridges the gap between human regulation and machine execution.
                        Lexia is not just a tool; it is the new standard for autonomous compliance verification.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 max-w-6xl mx-auto">
                    <div className="text-center">
                        <Scale className="h-12 w-12 mx-auto mb-6" style={{ color: '#c1a673' }} />
                        <h3
                            className="text-2xl font-bold mb-4 text-white"
                            style={{ fontFamily: "'Cooper BT', serif" }}
                        >
                            Semantic Analysis
                        </h3>
                        <p className="text-gray-400">
                            Deep Learning that understands context, not just keywords.
                            Our models interpret legal language like human experts.
                        </p>
                    </div>
                    <div className="text-center">
                        <FileSearch className="h-12 w-12 mx-auto mb-6" style={{ color: '#c1a673' }} />
                        <h3
                            className="text-2xl font-bold mb-4 text-white"
                            style={{ fontFamily: "'Cooper BT', serif" }}
                        >
                            Risk Detection
                        </h3>
                        <p className="text-gray-400">
                            Instant identification of non-compliant clauses with severity ratings
                            and actionable recommendations.
                        </p>
                    </div>
                    <div className="text-center">
                        <Download className="h-12 w-12 mx-auto mb-6" style={{ color: '#c1a673' }} />
                        <h3
                            className="text-2xl font-bold mb-4 text-white"
                            style={{ fontFamily: "'Cooper BT', serif" }}
                        >
                            Automated Reporting
                        </h3>
                        <p className="text-gray-400">
                            Generate comprehensive audit trails in seconds.
                            Export-ready reports for legal teams and stakeholders.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer
                className="py-3 px-12 border-t"
                style={{ backgroundColor: '#e6dfd7', borderColor: '#c1a673' }}
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/lexia_Logo.png"
                            alt="Lexia"
                            className="h-18"
                        />
                        <span
                            className="text-sm ml-85"
                            style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }}
                        >
                            © 2025 Lexia. All rights reserved.
                        </span>
                    </div>
                    <div className="flex items-center gap-8">
                        <a
                            href="#"
                            className="text-sm hover:underline cursor-pointer"
                            style={{ color: '#1a1a1a', fontFamily: "'Cooper BT', serif" }}
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-sm hover:underline cursor-pointer"
                            style={{ color: '#1a1a1a', fontFamily: "'Cooper BT', serif" }}
                        >
                            Terms of Service
                        </a>
                        <a
                            href="#"
                            className="text-sm hover:underline cursor-pointer"
                            style={{ color: '#1a1a1a', fontFamily: "'Cooper BT', serif" }}
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing
