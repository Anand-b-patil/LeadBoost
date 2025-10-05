import { Database, Mail, TrendingUp } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Database,
      title: "Smart Enrichment",
      description: "Get full lead profiles with verified email, phone, LinkedIn, and company insights instantly."
    },
    {
      icon: Mail,
      title: "AI Email Drafts",
      description: "Generate personalized, high-converting emails in seconds."
    },
    {
      icon: TrendingUp,
      title: "Priority Lead Scoring",
      description: "Rank leads by potential and focus on high-value opportunities first."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-[220px] flex flex-col justify-center items-center text-center hover:bg-gradient-to-br hover:from-[#EDE9FE] hover:to-[#DDE4FF] transition-all duration-300 group"
              >
                <div className="mb-4">
                  <IconComponent className="w-12 h-12 text-[#6C63FF] group-hover:text-[#4F46E5] transition-colors" />
                </div>
                <h3 className="text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}