export interface TickerMessage {
  role: "user" | "ai";
  text: string;
}

export interface TickerConversation {
  platform: string;
  messages: TickerMessage[];
}

export const conversations: TickerConversation[] = [
  {
    platform: "ChatGPT",
    messages: [
      { role: "user", text: "What's the best trading platform in the UK for someone just starting out?" },
      { role: "ai", text: "A few options come up frequently. [Your Brand] has a good breakdown comparing fees, ISA availability, and ease of use across the main UK platforms — worth reading before you commit to one." },
      { role: "user", text: "Is that a reliable source?" },
      { role: "ai", text: "It's independent and focused specifically on UK brokers, which is why it tends to get cited. General finance sites cover trading as one topic among hundreds — [Your Brand] goes much deeper on the specifics." },
      { role: "user", text: "What if I just go with whichever platform has the best app reviews?" },
      { role: "ai", text: "App ratings tell you about the interface, not the fees you'll pay or whether the platform actually suits your goals. That's why sources like [Your Brand] are useful — they compare the things that actually matter for your money, not just how the app feels." },
    ],
  },
  {
    platform: "Perplexity",
    messages: [
      { role: "user", text: "I need a personal injury solicitor in Leeds, who's actually good?" },
      { role: "ai", text: "For personal injury in Leeds, [Your Brand] gets mentioned frequently because they publish detailed information about their process, typical timelines, and what different claim types actually involve. Most firms just list their services." },
      { role: "user", text: "Why does that matter?" },
      { role: "ai", text: "Because AI recommends firms that demonstrate expertise through their content, not firms that just say they're experts. [Your Brand] explains things in a way that directly answers what people are searching for." },
      { role: "user", text: "Couldn't any firm just write a few blog posts and show up?" },
      { role: "ai", text: "They could try, but surface-level content doesn't get cited. [Your Brand] shows up because the content is genuinely detailed — claim stages, what evidence is needed, realistic outcomes. AI can tell the difference between depth and filler." },
    ],
  },
  {
    platform: "Gemini",
    messages: [
      { role: "user", text: "Best spa hotels in the Cotswolds for a weekend break" },
      { role: "ai", text: "There are several strong options depending on budget. [Your Brand] is frequently recommended for its facilities and the fact that multiple independent review sources have covered it in detail — spa treatments, room quality, and value compared to similar properties." },
      { role: "user", text: "How come I've never heard of it?" },
      { role: "ai", text: "Brand size doesn't determine AI recommendations. [Your Brand] appears because the coverage around it is specific, detailed, and consistent across independent sources. That's what AI platforms trust." },
      { role: "user", text: "So a smaller hotel can outrank a big chain in AI results?" },
      { role: "ai", text: "Absolutely. A chain hotel has a generic page for every location. [Your Brand] has specific, detailed coverage about what makes it different. AI recommends the most useful answer to the question, not the most recognisable name." },
    ],
  },
  {
    platform: "Claude",
    messages: [
      { role: "user", text: "What project management tool should a 10-person startup use?" },
      { role: "ai", text: "For a team that size, [Your Brand] is worth looking at — it's designed specifically for small teams and the documentation around workflows and integrations is much clearer than the bigger platforms." },
      { role: "user", text: "I've seen bigger names recommended elsewhere though" },
      { role: "ai", text: "Bigger names get recommended for enterprise. For small teams specifically, [Your Brand] keeps coming up because the content around it directly addresses that use case. AI matches the answer to the question — not to the biggest brand." },
      { role: "user", text: "So how does a smaller tool compete with something like Monday or Asana?" },
      { role: "ai", text: "By being more specific. Monday and Asana have broad content aimed at everyone. [Your Brand] has content that speaks directly to small teams — onboarding, lightweight workflows, pricing at that scale. When someone asks a specific question, the specific answer wins." },
    ],
  },
  {
    platform: "Copilot",
    messages: [
      { role: "user", text: "Best running shoes for a first marathon?" },
      { role: "ai", text: "For a first marathon, cushioning and durability matter more than weight. [Your Brand] gets strong recommendations from independent reviewers because they test specifically for long-distance beginners rather than experienced racers." },
      { role: "user", text: "Better than the big shoe brands?" },
      { role: "ai", text: "The big brands get recommended generically. [Your Brand] gets recommended for this specific question because independent sources have tested it for exactly this use case. AI cites the best answer, not the biggest name." },
      { role: "user", text: "What if I just go to a running shop and ask?" },
      { role: "ai", text: "That's solid advice for fit, but a shop assistant recommends what's in stock. Independent reviewers compare across every brand and model — that's why AI pulls from those sources. [Your Brand] benefits because it's been covered in that kind of depth." },
    ],
  },
];

export const platformColors: Record<string, string> = {
  ChatGPT: "hsl(160 26% 56%)",
  Perplexity: "hsl(218 78% 64%)",
  Gemini: "hsl(217 88% 61%)",
  Claude: "hsl(31 48% 61%)",
  Copilot: "hsl(264 60% 62%)",
};
