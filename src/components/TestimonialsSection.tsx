export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "LeadBoost transformed our sales process. We're now closing 40% more deals with better qualified leads.",
      company: "TechCorp",
      logo: "TC"
    },
    {
      quote: "The AI-powered email drafts save us hours every week and have doubled our response rates.",
      company: "GrowthCo",
      logo: "GC"
    },
    {
      quote: "Finally, a tool that actually helps us prioritize the leads that matter most to our business.",
      company: "ScaleUp",
      logo: "SU"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#EDE9FE] to-[#DDE4FF]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl mb-4">Trusted by Growing Companies</h2>
          <p className="text-gray-600">See what our customers say about LeadBoost</p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <div className="mb-6">
                <p className="text-gray-700 italic leading-relaxed">"{testimonial.quote}"</p>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#6C63FF] text-white rounded-full flex items-center justify-center mr-4">
                  {testimonial.logo}
                </div>
                <div>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}