import { useNavigate } from 'react-router-dom';
const ChunkyArrow = () => (
  <svg
    className="h-10 w-20 md:h-12 md:w-24 flex-shrink-0 filter drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-transform duration-200 group-hover:translate-x-1"
    viewBox="0 0 120 60"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 20 h55 V5 l45 25 -45 25 V40 H10 Z"
      stroke="black"
      strokeWidth="7"
      strokeLinejoin="miter"
    />
  </svg>
);
export function QuickGenerateCard() {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/dashboard?tab=generator')}
      className="relative cursor-pointer group select-none rounded-[20px] p-6 border-[4px] border-black dark:border-black transition-all duration-150 ease-out bg-[#F04D3A] shadow-card hover:translate-y-[-2px] hover:shadow-card-hover active:translate-y-[2px] active:shadow-sm"
      style={{ minHeight: '140px' }}
    >
      <div className="flex items-center justify-between h-full gap-4">
        {/* Left Side: Typography */}
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black font-heading text-white leading-none tracking-tight">
            Quick
            <br />
            Generate
          </h2>
        </div>

        {/* Right Side: Blocky Arrow */}
        <div className="flex items-center justify-center">
          <ChunkyArrow />
        </div>
      </div>
    </div>
  );
}
