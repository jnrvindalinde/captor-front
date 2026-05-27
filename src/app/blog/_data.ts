export type ContentBlock = 
  | { type: "paragraph"; content: string }
  | { type: "bulletList"; items: string[] }
  | { type: "numberedList"; items: string[] }
  | { type: "indented"; content: string };

export type BlogSection = {
  heading: string;
  blocks: ContentBlock[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  hero: string;
  date: string;
  author: { name: string; role: string };
  readTime: string;
  tags: string[];
  sections: BlogSection[];
};

export const blogs: BlogPost[] = [
  {
    slug: "the-power-of-vulnerability-in-your-application",
    title: "The power of vulnerability in your application",
    excerpt: "Why showing your struggles, not just your strengths, makes admissions officers sit up and pay attention.",
    hero: "/imports/18702.jpg",
    date: "May 10, 2025",
    readTime: "8 min read",
    author: { name: "Ama Owusu", role: "Lead Coach" },
    tags: ["Personal Essays", "Application Strategy", "Storytelling"],
    sections: [
      {
        heading: "Why vulnerability matters in admissions",
        blocks: [
          { type: "paragraph", content: "Universities are looking for authentic human beings, not perfect robots. The most compelling essays reveal something real—a moment of doubt, a failure that taught you something, a struggle that shaped who you are. Admissions officers read thousands of essays every year, and what they remember isn't polish or perfection. It's honesty." },
          { type: "paragraph", content: "When you show vulnerability, you give admissions officers something they rarely see: real humanity. And humanity stands out. The essays that get talked about in admissions meetings aren't always the ones with the highest grades or most impressive achievements. They're the ones where someone took a real risk and showed who they actually are." },
          { type: "paragraph", content: "This doesn't mean oversharing or trauma-dumping. It means being strategic about revealing something genuine that shows growth, self-awareness, and resilience. Universities want to understand not just what you've accomplished, but how you handle adversity and what you've learned from difficulty." },
        ],
      },
      {
        heading: "What vulnerability actually looks like",
        blocks: [
          { type: "paragraph", content: "Let's be clear: vulnerability isn't weakness. In the context of college applications, it's showing that you're self-aware enough to recognize your limitations and resilient enough to grow from them." },
          { type: "bulletList", items: ["Admitting you didn't understand something and how you figured it out", "Sharing a time you failed and what that failure taught you", "Revealing a prejudice or bias you once held and how your thinking changed", "Explaining a setback and how it redirected your path", "Being honest about your doubts before you found your direction"] },
          { type: "paragraph", content: "Each of these examples shows something important about character: curiosity, resilience, growth mindset, and self-reflection. These are exactly the things universities are looking for." },
        ],
      },
      {
        heading: "How to write vulnerably without oversharing",
        blocks: [
          { type: "numberedList", items: ["Choose a specific moment, not a sweeping narrative", "Show the impact it had on you—not just what happened, but how it changed you", "Explain what you learned, focusing on growth not blame", "Avoid self-pity and self-punishment—this is about understanding, not flagellating yourself", "Leave the reader with hope or clarity about who you've become"] },
          { type: "paragraph", content: "The best vulnerable essays have a clear arc: here's what I faced, here's what I felt, here's what I learned, here's who I am because of it. Without that arc, vulnerability just becomes complaining." },
        ],
      },
      {
        heading: "What not to do",
        blocks: [
          { type: "bulletList", items: ["Don't reveal trauma or mental health struggles if you're not in a stable place with them", "Don't use vulnerability as an excuse—'I failed because I was sad' vs 'I failed, then learned how to ask for help'", "Don't reveal something that will genuinely concern admissions officers", "Don't be vulnerable just for the sake of being vulnerable—only if it's true and relevant", "Don't use the essay to work through unresolved issues"] },
        ],
      },
    ],
  },
  {
    slug: "five-international-scholarships-nobody-talks-about",
    title: "Five international scholarships nobody talks about",
    excerpt: "Lesser-known funding opportunities that are waiting for you—and they're not as competitive as you think.",
    hero: "/imports/2148814175.jpg",
    date: "May 3, 2025",
    readTime: "12 min read",
    author: { name: "Kojo Ansah", role: "Director" },
    tags: ["Scholarships", "Funding", "International Study"],
    sections: [
      {
        heading: "The overlooked funding landscape",
        blocks: [
          { type: "paragraph", content: "Everyone knows about Rhodes, Chevening, and Mastercard. But while everyone applies there, thousands of equally generous scholarships sit partially or completely unfunded. The competitive advantage lies in the programs nobody's heard of." },
          { type: "paragraph", content: "This guide covers five programs that offer full tuition, living stipend, and travel grants—with significantly lower competition. Some have less than 100 applicants globally." },
        ],
      },
      {
        heading: "1. Oppenheimer Memorial Trust",
        blocks: [
          { type: "paragraph", content: "Full tuition + R1,500/month stipend + travel costs. Study anywhere in the world. This program is relatively new and not widely marketed outside South Africa. Many don't realize South Africans can apply from anywhere." },
          { type: "paragraph", content: "Usually 200-300 applicants. Their focus is on leadership and service, not just academics." },
        ],
      },
      {
        heading: "2. African Leadership Academy Fellowship",
        blocks: [
          { type: "paragraph", content: "Full tuition, room & board, books, and a $2,000 annual discretionary budget. Many think it's only for high school. The emerging leaders program for early career professionals has even lower competition." },
          { type: "paragraph", content: "Medium-high competition. They're looking for people committed to African development with demonstrated impact." },
        ],
      },
      {
        heading: "3. Mandela Washington Fellowship",
        blocks: [
          { type: "paragraph", content: "Full sponsorship for a year of study in the US, covering tuition, housing, health insurance, books, and monthly stipend. The demanding application process deters people from applying. You can reapply multiple times—we've had clients who got in on their second or third attempt." },
          { type: "paragraph", content: "High competition, but reapplicable. They're looking for emerging leaders with demonstrated community impact." },
        ],
      },
      {
        heading: "4. Erasmus+ Joint Masters Scholarships",
        blocks: [
          { type: "paragraph", content: "Full tuition + €934/month living stipend + travel. Study across multiple European countries. International students don't realize they're eligible. The technical application deters casual applicants." },
          { type: "paragraph", content: "Low to medium competition. 50-200 applicants depending on program. Fewer people know about it outside Europe." },
        ],
      },
      {
        heading: "5. Asia-Pacific Economic Cooperation Fellowship",
        blocks: [
          { type: "paragraph", content: "Full funding for graduate study in any APEC member country covering much of Asia, Australia, and the Americas. Newer and less established than Commonwealth scholarships. Most people don't realize how many countries participate." },
          { type: "paragraph", content: "Low competition. Under 100 applications typically. They're looking for leaders to strengthen APEC ties." },
        ],
      },
    ],
  },
  {
    slug: "how-to-network-when-youre-an-introvert",
    title: "How to network when you're an introvert",
    excerpt: "Forget the loud conferences. Here's how introverts actually build meaningful professional relationships.",
    hero: "/imports/working-from-home-ergonomic-workstation.jpg",
    date: "April 26, 2025",
    readTime: "7 min read",
    author: { name: "Akua Boateng", role: "Senior Advisor" },
    tags: ["Networking", "Career Development", "Professional Growth"],
    sections: [
      {
        heading: "Redefining networking",
        blocks: [
          { type: "paragraph", content: "Networking doesn't have to mean working a room full of strangers. It means building genuine relationships with people in your field. Introverts are actually really good at this—just in a different way." },
          { type: "paragraph", content: "The problem is we're trying to network like extroverts, which leaves us exhausted and disappointed. Instead of trying to talk to everyone, focus on talking to the right people—deeply. Depth beats breadth every single time." },
        ],
      },
      {
        heading: "Why introverts have an advantage",
        blocks: [
          { type: "bulletList", items: ["We listen more than we talk, which means people open up to us", "We prepare thoroughly, which makes our contributions memorable", "We build deeper one-on-one relationships rather than surface connections", "We're often better at follow-up and follow-through", "We tend to be reflective, which people find trustworthy"] },
        ],
      },
      {
        heading: "Strategies that work",
        blocks: [
          { type: "numberedList", items: ["Start one-on-one coffee meetings instead of large mixers", "Use online communities to find your people first, then meet in person", "Be the expert—write, speak, or share knowledge in your niche", "Follow up consistently with meaningful check-ins", "Schedule networking in small doses to avoid burnout"] },
          { type: "paragraph", content: "Each of these shifts the dynamic from 'attend every event' to 'build real relationships.' You'll be less exhausted and more effective." },
        ],
      },
    ],
  },
  {
    slug: "graduate-school-or-gap-year-the-real-tradeoffs",
    title: "Graduate school or gap year? The real tradeoffs",
    excerpt: "Neither choice is universal. Here's how to make the decision that's right for your goals.",
    hero: "/imports/scholarship.jpg",
    date: "April 19, 2025",
    readTime: "10 min read",
    author: { name: "Derek Osei", role: "Alumni Advisor" },
    tags: ["Graduate School", "Career Planning", "Decision Making"],
    sections: [
      {
        heading: "The decision nobody talks about clearly",
        blocks: [
          { type: "paragraph", content: "After your undergraduate degree, you face a fork in the road: immediate graduate school or a gap year? This decision feels weighted with pressure and few good resources. Everyone has an opinion. The real answer is that it depends entirely on you." },
        ],
      },
      {
        heading: "The case for grad school",
        blocks: [
          { type: "bulletList", items: ["You know exactly what field you want and need a credential to enter it", "Your industry's timeline works better with straight-through education", "You want to delay entry into the full-time job market", "You're intellectually hungry for more learning and momentum matters", "Your field has better tuition support if you go straight through"] },
          { type: "paragraph", content: "If most of these describe you, going straight through makes sense. You're not avoiding anything; you're intentionally deepening expertise." },
        ],
      },
      {
        heading: "The case for a gap year",
        blocks: [
          { type: "bulletList", items: ["You're genuinely unsure about your direction", "You want real-world experience before committing $80K+ to grad school", "You need a break from formal education to prevent burnout", "You want to save money before investing in grad school", "You want to verify your perceived career path actually interests you in practice"] },
          { type: "paragraph", content: "A gap year isn't 'falling behind.' It's a strategic pause that often leads to better decisions." },
        ],
      },
      {
        heading: "Questions to ask yourself",
        blocks: [
          { type: "numberedList", items: ["Will this choice close or open doors for me later?", "Am I doing this because I want to, or because I feel like I should?", "What will I regret not doing?", "What's the financial reality for each option?", "Where will I be in 5 years with each choice?"] },
        ],
      },
    ],
  },
  {
    slug: "what-we-wish-someone-told-us-before-we-applied",
    title: "What we wish someone told us before we applied",
    excerpt: "Reflections from accepted students—the practical wisdom nobody mentions until after you get in.",
    hero: "/imports/18702.jpg",
    date: "April 12, 2025",
    readTime: "9 min read",
    author: { name: "Ama Owusu", role: "Lead Coach" },
    tags: ["Application Advice", "Student Stories", "Lessons Learned"],
    sections: [
      {
        heading: "What 500 admitted students wish they knew",
        blocks: [
          { type: "paragraph", content: "We've interviewed over 500 admitted students about their application journeys. We asked them one simple question: 'What do you wish someone had told you before you started applications?' The answers were remarkably consistent." },
        ],
      },
      {
        heading: "Your grades and test scores matter less than context",
        blocks: [
          { type: "paragraph", content: "Students repeatedly said: 'I thought my GPA would eliminate me, but I got in anyway. My 3.3 wasn't the barrier I thought it was.' Meanwhile, some with perfect GPAs didn't get in. Why? Universities aren't sorting by algorithms. They're looking for humans." },
          { type: "paragraph", content: "Yes, grades matter. But context matters more. A 3.3 from a student working 30 hours a week is more impressive than a 3.8 from someone with every advantage. Universities can read context." },
        ],
      },
      {
        heading: "Schools care about your story, not your achievements list",
        blocks: [
          { type: "paragraph", content: "One accepted student shared: 'I spent weeks crafting a list of all my volunteer work and leadership positions, then my recommender suggested I write about a single lunch conversation that changed my perspective. That essay is the one that got talked about.' Specificity and story beat impressive lists." },
        ],
      },
      {
        heading: "Timing is as important as content",
        blocks: [
          { type: "paragraph", content: "Students who applied early reported less stress and better outcomes. Not because schools prefer early applicants, but because they had time to think, revise, and do real work. Last-minute applications feel rushed, and schools can tell." },
        ],
      },
      {
        heading: "Pick recommenders who actually know you",
        blocks: [
          { type: "paragraph", content: "Admitted students said: 'I picked the most famous teacher for credibility, but the recommendation felt generic. My other recommender wrote something so specific and personal—that's the one that mattered.' Pick people who actually know you, not people with impressive titles." },
        ],
      },
    ],
  },
  {
    slug: "the-interview-question-nobody-prepares-for",
    title: "The interview question nobody prepares for",
    excerpt: "'Tell me about yourself.' Here's how to answer the question everyone gets wrong.",
    hero: "/imports/2148814175.jpg",
    date: "April 5, 2025",
    readTime: "6 min read",
    author: { name: "Kojo Ansah", role: "Director" },
    tags: ["Interviews", "Preparation", "Communication"],
    sections: [
      {
        heading: "Why this question trips everyone up",
        blocks: [
          { type: "paragraph", content: "It's so open-ended. You can answer in a thousand ways. And that's exactly why most people answer it wrong. When you're not sure what to say, you either give a bland bio or overshare. The interviewer wants neither." },
          { type: "paragraph", content: "The best answers aren't about yourself. They're about why you're in this interview, right now, talking to this person." },
        ],
      },
      {
        heading: "What interviewers are actually asking",
        blocks: [
          { type: "paragraph", content: "When an interviewer asks 'Tell me about yourself,' they're asking: 'Help me understand why you're here and what you care about.' Not your resume. Not your life story. The intersection of who you are and why you're pursuing this opportunity." },
        ],
      },
      {
        heading: "The structure that works",
        blocks: [
          { type: "numberedList", items: ["Start with something specific about what got you interested in this field", "Connect it to why you're in this interview right now", "Show what you're curious about going forward", "End with a door for them to ask follow-ups"] },
          { type: "paragraph", content: "This gives them something real to grab onto, shows you've thought about why this matters, and keeps the conversation flowing." },
        ],
      },
    ],
  },
];

export function getBlog(slug: string): BlogPost | undefined {
  return blogs.find((blog) => blog.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogs.map((blog) => blog.slug);
}
