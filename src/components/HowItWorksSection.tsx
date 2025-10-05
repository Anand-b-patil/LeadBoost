import { Upload, Brain, Send } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "Input leads",
      description: "(chatbot or CSV)"
    },
    {
      icon: Brain,
      title: "AI enriches & scores leads",
      description: "Automatically validate and score"
    },
    {
      icon: Send,
      title: "Export, email, or LinkedIn outreach",
      description: "Take action on qualified leads"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl mb-4">How It Works</h2>
          <p className="text-gray-600">Three simple steps to supercharge your lead generation</p>
        </div>

        <div className="flex justify-center items-center space-x-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center relative">
                {/* Number Badge */}
                <div className="w-10 h-10 bg-[#6C63FF] text-white rounded-full flex items-center justify-center mb-6 text-lg">
                  {index + 1}
                </div>

                {/* Step Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-64 h-32 flex flex-col justify-center items-center">
                  <IconComponent className="w-8 h-8 text-[#6C63FF] mb-3" />
                  <h3 className="text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="absolute top-5 -right-6 w-12 h-0.5 bg-[#6C63FF] opacity-30">
                    <div className="absolute right-0 top-[-2px] w-0 h-0 border-l-4 border-l-[#6C63FF] border-t-2 border-b-2 border-t-transparent border-b-transparent opacity-30"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}