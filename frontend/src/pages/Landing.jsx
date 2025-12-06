import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
        <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#e6dfd7' }}>
            {/* Header */}
            <header className="flex justify-between items-center px-12 py-6">
                {/* Logo */}
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

                {/* Top Right Button */}
                <button
                    onClick={handleStartAnalysis}
                    className="flex items-center gap-2 px-8 py-3 bg-black rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer"
                    style={{
                        opacity: isLoaded ? 1 : 0,
                        transform: isLoaded ? 'translateY(0)' : 'translateY(-30px)',
                        transition: 'all 1s ease-out 0.3s'
                    }}
                >
                    <img
                        src="/images/lexia_icon.png"
                        alt="Icon"
                        className="h-8 w-8"
                    />
                    <span
                        style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }}
                        className="text-lg font-semibold"
                    >
                        Start Analysis
                    </span>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center px-12">
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
                        {/* Main Title */}
                        <div>
                            <h1
                                className="text-6xl font-bold leading-none mb-1"
                                style={{ fontFamily: "'Cooper BT', serif" }}
                            >
                                <span className="text-black">LEXIA </span>
                                <img
                                    src="/images/lexia_icon.png"
                                    alt="X"
                                    className="inline h-18 w-18 mb-2 cursor-pointer"
                                    style={{ verticalAlign: 'middle', position: 'relative', top: '-2px' }}
                                />
                                <span className="text-black"> : Autonomous</span>
                            </h1> 
                            <h1 
                                className="text-6xl font-bold leading-none"
                                style={{ fontFamily: "'Cooper BT', serif" }}
                            >
                                <span className="text-black">Compliance Agent</span>
                            </h1>
                        </div>

                        {/* Description with Border */}
                        <div className="border-l-4 border-black pl-6">
                            <p
                                className="text-2xl leading-relaxed"
                                style={{ color: 'black', fontFamily: "'Cooper BT', serif" }}
                            >
                                AI agents that analyze regulations, detect policy conflicts, and generate clear compliance reports.
                            </p>
                        </div>

                        {/* Bottom Button */}
                        <div
                            className="transition-all duration-1000 ease-out"
                            style={{
                                opacity: isLoaded ? 1 : 0,
                                transform: isLoaded ? 'scale(1)' : 'scale(0.8)',
                                transitionDelay: '0.6s'
                            }}
                        >
                            <button
                                onClick={handleStartAnalysis}
                                className="flex items-center gap-3 px-10 py-4 bg-black rounded-full shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl group"
                            >
                                <img
                                    src="/images/lexia_icon.png"
                                    alt="Icon"
                                    className="h-8 w-8 transition-transform duration-300 ease-in-out group-hover:rotate-12"
                                />
                                <span
                                    style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }}
                                    className="text-xl font-semibold"
                                >
                                    Start Analysis
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Hero Image */}
                    <div 
                        className="flex items-center justify-center transition-all duration-1000 ease-out"
                        style={{
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateX(0)' : 'translateX(100px)',
                            transitionDelay: '0.4s'
                        }}
                    >
                        <img
                            src="/images/hero_pic.png"
                            alt="AI Robot with Justice Scales"
                            className="w-full max-w-2xl object-contain"
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Landing
