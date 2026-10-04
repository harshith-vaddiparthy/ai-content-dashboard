import type { ContentItem, ContentStatus, ContentType } from "@/lib/content/types"

/**
 * Example content shown until a real database is connected ("sample mode").
 * Dates are relative to when the app starts, so the dashboard always looks
 * current. Everything here is fictional.
 */

type Seed = {
  type: ContentType
  title: string
  /** How many days before "now" the piece was created. */
  daysAgo: number
  status: ContentStatus
  intro: string
  points: [string, string, string]
  views?: number
  opens?: number
  /** Video only. */
  format?: "Vertical 9:16" | "Landscape 16:9" | "Square 1:1"
  seconds?: number
}

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000

// The sample story: the writer switched models 96 days ago (see Issue #6).
const MODEL_SWITCH_DAYS_AGO = 96
const EARLIER_MODEL = "openai/gpt-6.1-sol"
const CURRENT_MODEL = "anthropic/claude-sonnet-5.5"

const SEEDS: Seed[] = [
  // Blog posts
  {
    type: "blog",
    title: "How I run a one-person content studio with AI",
    daysAgo: 172,
    status: "published",
    views: 4820,
    intro:
      "Six months ago I was writing everything by hand and shipping one post a month. Now I publish every week without working weekends. Here's the system.",
    points: [
      "AI writes the first draft. I own the outline and the final edit.",
      "Every idea gets turned into a post, a newsletter section and a short video.",
      "One dashboard holds the whole pipeline, so nothing gets lost in a doc somewhere.",
    ],
  },
  {
    type: "blog",
    title: "The prompt template I use for every client brief",
    daysAgo: 158,
    status: "published",
    views: 3110,
    intro:
      "Most bad AI output comes from vague input. This is the brief template I give the model before it writes a single word for a client.",
    points: [
      "Start with who it's for and what they should do after reading.",
      "Paste two examples of writing the client already likes.",
      "List the phrases to avoid. It matters more than the phrases to use.",
    ],
  },
  {
    type: "blog",
    title: "Why I stopped writing first drafts by hand",
    daysAgo: 143,
    status: "published",
    views: 2675,
    intro:
      "The blank page was costing me two hours per post. Editing a decent draft takes twenty minutes, and the result is better.",
    points: [
      "First drafts are about structure, not voice.",
      "My voice shows up in the edit: cutting, reordering, adding stories.",
      "The time I save goes into research and distribution.",
    ],
  },
  {
    type: "blog",
    title: "Pricing AI consulting work without underselling it",
    daysAgo: 129,
    status: "published",
    views: 5940,
    intro:
      "If AI makes you faster, charging by the hour punishes you for getting better. Here's how I moved to project pricing.",
    points: [
      "Price the outcome the client cares about, not the hours you spend.",
      "Offer three tiers so the conversation is about scope, not discounts.",
      "Keep a short list of past results. It's your strongest pricing tool.",
    ],
  },
  {
    type: "blog",
    title: "A practical guide to choosing an AI model for writing",
    daysAgo: 115,
    status: "published",
    views: 3380,
    intro:
      "There are dozens of models and the leaderboards change monthly. For writing, three questions narrow it down fast.",
    points: [
      "Does it follow a style guide without drifting halfway through?",
      "Does it stay accurate when you give it source notes?",
      "Is the cost per post low enough that you'll actually regenerate?",
    ],
  },
  {
    type: "blog",
    title: "What 100 AI-written drafts taught me about editing",
    daysAgo: 99,
    status: "published",
    views: 2210,
    intro:
      "After editing a hundred AI drafts, the same fixes keep coming up. Here they are, roughly in order of impact.",
    points: [
      "Cut the first paragraph. The real opening is usually the second one.",
      "Replace every abstract claim with a specific example.",
      "Read it out loud. If you wouldn't say it, rewrite it.",
    ],
  },
  {
    type: "blog",
    title: "Building in public: month three numbers",
    daysAgo: 86,
    status: "published",
    views: 1840,
    intro:
      "Three months in, here's what's growing, what's flat, and what I'm changing next month.",
    points: [
      "Newsletter opens are up every single week.",
      "Short videos bring in new people; long posts are what convert them.",
      "Next month: fewer topics, more depth on each one.",
    ],
  },
  {
    type: "blog",
    title: "The tools I'd pick if I started my consultancy today",
    daysAgo: 72,
    status: "published",
    views: 4105,
    intro:
      "If I were starting over with no audience and no clients, this is the short list I'd begin with.",
    points: [
      "One place to write, one place to publish, one place to track results.",
      "An AI model you've tested on your own writing, not on benchmarks.",
      "A simple CRM. A spreadsheet counts.",
    ],
  },
  {
    type: "blog",
    title: "How to turn one idea into a week of content",
    daysAgo: 58,
    status: "published",
    views: 3560,
    intro:
      "Every week starts with one idea. By Friday it has become a post, a newsletter and two short videos.",
    points: [
      "Monday: write the long post, because everything else is cut from it.",
      "Wednesday: the newsletter adds the behind-the-scenes story.",
      "Friday: videos take the single sharpest point from the post.",
    ],
  },
  {
    type: "blog",
    title: "Automating client reports with a tiny Next.js app",
    daysAgo: 45,
    status: "published",
    views: 2890,
    intro:
      "Monthly client reports used to eat a full afternoon. A 200-line app now drafts them, and I just review.",
    points: [
      "Pull the numbers automatically. Never copy and paste.",
      "Let the model write the summary, and keep the numbers as hard facts it can't change.",
      "Always send it yourself. Automation drafts, humans deliver.",
    ],
  },
  {
    type: "blog",
    title: "Five mistakes I made shipping my first AI product",
    daysAgo: 31,
    status: "published",
    views: 1975,
    intro:
      "The product worked. The launch didn't. Here are the mistakes, so you can skip them.",
    points: [
      "I built features before I had ten people asking for them.",
      "I hid the AI's limits instead of designing around them.",
      "I launched once and stopped talking about it.",
    ],
  },
  {
    type: "blog",
    title: "Writing with AI without sounding like AI",
    daysAgo: 20,
    status: "published",
    views: 1260,
    intro:
      "Readers can tell when a post was generated and never edited. These are the habits that keep my writing sounding like me.",
    points: [
      "Ban the words you'd never say out loud.",
      "Add one real story per post, preferably one that went wrong.",
      "End with a clear opinion, not a summary.",
    ],
  },
  {
    type: "blog",
    title: "My weekly content system, step by step",
    daysAgo: 9,
    status: "published",
    views: 640,
    intro:
      "This is the exact checklist I run every Monday morning, including the parts that are still manual.",
    points: [
      "Pick one idea from the backlog and write a three-line brief.",
      "Generate the draft, then edit in two passes: structure first, then voice.",
      "Schedule everything before lunch so the afternoon is free for client work.",
    ],
  },
  {
    type: "blog",
    title: "When not to use AI in client work",
    daysAgo: 16,
    status: "draft",
    intro:
      "AI is great at first drafts and terrible at a few things clients care about a lot. Here's where I draw the line.",
    points: [
      "Anything that needs the client's private data. Keep it out of prompts.",
      "Hard conversations, like pricing changes or bad news.",
      "Final sign-off. A person should always approve what goes out.",
    ],
  },
  {
    type: "blog",
    title: "A simple framework for repurposing long-form posts",
    daysAgo: 3,
    status: "draft",
    intro:
      "Most repurposing advice is 'post it everywhere'. This framework is about picking the right piece for each channel.",
    points: [
      "Find the one sentence people would screenshot.",
      "Turn the steps into a checklist for the newsletter.",
      "Turn the strongest opinion into a 30-second video.",
    ],
  },
  {
    type: "blog",
    title: "Notes from my first year of consulting",
    daysAgo: 165,
    status: "archived",
    views: 1430,
    intro:
      "An older reflection post. Archived because most of it is now covered in the pricing and tools posts.",
    points: [
      "Say no to work outside your niche.",
      "Write every proposal as if it will be forwarded to the boss.",
      "Your first five clients come from people who already know you.",
    ],
  },

  // Newsletters
  {
    type: "newsletter",
    title: "Issue #1: Why I'm building this in public",
    daysAgo: 168,
    status: "published",
    opens: 420,
    intro:
      "Welcome to the first issue. Every week I'll share what I'm building, what's working and what isn't.",
    points: [
      "Why I'm documenting the whole process.",
      "The one-person studio setup, in brief.",
      "What to expect from this newsletter.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #2: The AI stack I actually pay for",
    daysAgo: 154,
    status: "published",
    opens: 515,
    intro:
      "Everyone shares their tool stack. Here's mine, with what each piece costs per month.",
    points: [
      "The writing model and why I picked it.",
      "The two automations that save the most time.",
      "The tools I cancelled after a month.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #3: One prompt, three formats",
    daysAgo: 140,
    status: "published",
    opens: 590,
    intro:
      "This week's experiment: one brief turned into a post, an email and a script, each edited for its format.",
    points: [
      "The brief I started from.",
      "What changed between formats.",
      "Which version did best.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #4: What clients really ask for",
    daysAgo: 126,
    status: "published",
    opens: 640,
    intro:
      "I went back through every client request from the last quarter. The pattern surprised me.",
    points: [
      "The request that comes up most.",
      "Why 'more content' is rarely the real ask.",
      "How I changed my offer because of it.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #5: Shipping beats polishing",
    daysAgo: 112,
    status: "published",
    opens: 705,
    intro:
      "I spent two weeks polishing a post that got fewer reads than one I wrote in an hour. Here's what I took from that.",
    points: [
      "Where polish matters and where it doesn't.",
      "My new rule: publish at 80 percent.",
      "One reader question, answered.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #6: The model I switched to (and why)",
    daysAgo: 96,
    status: "published",
    opens: 820,
    intro:
      "After a month of side-by-side tests, I've switched my default writing model. Here's the comparison.",
    points: [
      "How I tested: same briefs, blind edits.",
      "Where the new model is clearly better.",
      "What I miss from the old one.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #7: A month of AI video experiments",
    daysAgo: 82,
    status: "published",
    opens: 910,
    intro:
      "Video was the format I avoided. This month I made one short video a week with AI and tracked everything.",
    points: [
      "What it actually costs per video.",
      "The style that performed best.",
      "Why I review every script before rendering.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #8: How I price a content retainer",
    daysAgo: 66,
    status: "published",
    opens: 1040,
    intro:
      "Lots of you asked about retainers after the pricing post. Here's the exact structure I use.",
    points: [
      "The three tiers and what's in each.",
      "How I handle revisions without scope creep.",
      "The clause that saved me twice.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #9: Small tools, big leverage",
    daysAgo: 50,
    status: "published",
    opens: 1125,
    intro:
      "The most useful things I built this year were tiny. Each one took an evening.",
    points: [
      "The report generator.",
      "The idea backlog that sorts itself.",
      "The tool I built and never used.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #10: What's working on LinkedIn right now",
    daysAgo: 36,
    status: "published",
    opens: 1210,
    intro:
      "I looked at my last 40 LinkedIn posts. Three formats beat everything else.",
    points: [
      "Before-and-after breakdowns.",
      "Short opinions with one example.",
      "Behind-the-scenes numbers.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #11: Building a dashboard for my own content",
    daysAgo: 22,
    status: "published",
    opens: 1340,
    intro:
      "I got tired of tracking content across five tools, so I'm building one dashboard for all of it.",
    points: [
      "What it does: generate, organise, track.",
      "What it deliberately doesn't do.",
      "Why I'm making it open source.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #12: Behind the scenes of a client launch",
    daysAgo: 6,
    status: "published",
    opens: 1185,
    intro:
      "Last week a client launched their course. Here's the content plan we used, week by week.",
    points: [
      "The four-week runway.",
      "Which pieces we generated and which we wrote by hand.",
      "The results so far.",
    ],
  },
  {
    type: "newsletter",
    title: "Issue #13: Lessons from 90 days of AI video",
    daysAgo: 2,
    status: "draft",
    intro:
      "Ninety days and a dozen videos in, here's my honest review of AI video for a solo business.",
    points: [
      "The numbers, including the flops.",
      "What I'd change about my process.",
      "Whether it's worth it for you.",
    ],
  },

  // Videos
  {
    type: "video",
    title: "Test render: talking-head style",
    daysAgo: 100,
    status: "archived",
    format: "Landscape 16:9",
    seconds: 20,
    intro: "A quick test of the talking-head style before committing to a series.",
    points: [
      "Presenter introduces the channel.",
      "Cut to screen recording of the dashboard.",
      "End card with the newsletter link.",
    ],
  },
  {
    type: "video",
    title: "My AI writing workflow in 60 seconds",
    daysAgo: 94,
    status: "published",
    views: 12400,
    format: "Vertical 9:16",
    seconds: 60,
    intro: "You don't need to write faster. You need to stop starting from a blank page.",
    points: [
      "Show the three-line brief being typed.",
      "Fast-forward through the draft appearing.",
      "Show the edit: crossing out the first paragraph.",
    ],
  },
  {
    type: "video",
    title: "Three prompts every consultant should save",
    daysAgo: 80,
    status: "published",
    views: 8650,
    format: "Vertical 9:16",
    seconds: 45,
    intro: "Save these three prompts and you'll never write a client brief from scratch again.",
    points: [
      "Prompt one: the client brief.",
      "Prompt two: the proposal outline.",
      "Prompt three: the follow-up email.",
    ],
  },
  {
    type: "video",
    title: "Before and after: editing an AI draft",
    daysAgo: 67,
    status: "published",
    views: 15200,
    format: "Vertical 9:16",
    seconds: 50,
    intro: "This is what an AI draft looks like before I touch it, and after.",
    points: [
      "Split screen: raw draft on the left, edited version on the right.",
      "Highlight the three biggest cuts.",
      "Read the final opening line out loud.",
    ],
  },
  {
    type: "video",
    title: "How I plan a week of content in 10 minutes",
    daysAgo: 53,
    status: "published",
    views: 9800,
    format: "Landscape 16:9",
    seconds: 90,
    intro: "Ten minutes on Monday morning is all the planning I do. Here's how.",
    points: [
      "Open the idea backlog and pick one.",
      "Write the brief and generate the long post.",
      "Mark which parts become the newsletter and the videos.",
    ],
  },
  {
    type: "video",
    title: "The one-person agency tech stack",
    daysAgo: 41,
    status: "published",
    views: 21300,
    format: "Vertical 9:16",
    seconds: 40,
    intro: "Everything I use to run a one-person agency, in under a minute.",
    points: [
      "Quick cuts of each tool with its monthly cost.",
      "The one tool I'd keep if I could only keep one.",
      "Total monthly cost on screen.",
    ],
  },
  {
    type: "video",
    title: "Why your AI content sounds generic",
    daysAgo: 28,
    status: "published",
    views: 6750,
    format: "Square 1:1",
    seconds: 35,
    intro: "If your AI posts sound like everyone else's, it's probably the brief, not the model.",
    points: [
      "Show a vague brief and the bland output it produces.",
      "Show a specific brief and the sharper output.",
      "Overlay the one line that made the difference.",
    ],
  },
  {
    type: "video",
    title: "Turning a blog post into a short video",
    daysAgo: 17,
    status: "published",
    views: 4120,
    format: "Vertical 9:16",
    seconds: 45,
    intro: "Every blog post has a 30-second video hiding inside it. Here's how to find it.",
    points: [
      "Scroll through a long post and highlight one sentence.",
      "Turn that sentence into the hook.",
      "Cut to the finished video playing.",
    ],
  },
  {
    type: "video",
    title: "Client onboarding, automated",
    daysAgo: 39,
    status: "ready",
    format: "Landscape 16:9",
    seconds: 75,
    intro: "New client signs, and five things happen automatically before our first call.",
    points: [
      "The welcome email goes out.",
      "The shared folder and brief template are created.",
      "The kickoff call is booked from my calendar.",
    ],
  },
  {
    type: "video",
    title: "What I'd tell myself before starting a consultancy",
    daysAgo: 13,
    status: "ready",
    format: "Vertical 9:16",
    seconds: 55,
    intro: "Three things I wish someone had told me before I went solo.",
    points: [
      "Charge more than feels comfortable.",
      "Pick a niche before you need one.",
      "Build an audience while you have clients, not after.",
    ],
  },
  {
    type: "video",
    title: "Quick tip: naming your prompt library",
    daysAgo: 34,
    status: "failed",
    format: "Square 1:1",
    seconds: 25,
    intro: "A prompt you can't find is a prompt you'll rewrite. Name them like this.",
    points: [
      "Show a messy folder of prompts.",
      "Rename them: task, audience, format.",
      "Search finds the right one instantly.",
    ],
  },
  {
    type: "video",
    title: "Building a content dashboard in a weekend",
    daysAgo: 9,
    status: "draft",
    format: "Landscape 16:9",
    seconds: 120,
    intro: "I built my own content dashboard in a weekend. Here's the timelapse.",
    points: [
      "Saturday morning: sketching the screens on paper.",
      "Saturday night: the first working page.",
      "Sunday: generating the first real post with it.",
    ],
  },
  {
    type: "video",
    title: "Behind the scenes: recording with an AI avatar",
    daysAgo: 0,
    status: "processing",
    format: "Vertical 9:16",
    seconds: 40,
    intro: "No camera, no lights, no retakes. This is how an AI avatar video gets made.",
    points: [
      "Write the script in the dashboard.",
      "Pick the avatar and the voice.",
      "Watch the render come back.",
    ],
  },
]

const BLOG_CLOSINGS = [
  "If you try this, I'd love to hear how it goes.",
  "That's the whole system. Steal whatever's useful.",
  "More on this in the newsletter next week.",
  "None of this is fancy. It just works, week after week.",
]

const VIDEO_CTAS = [
  "Follow for one workflow a week.",
  "Grab the full template in the newsletter.",
  "Comment 'brief' and I'll send you the template.",
]

function buildBody(seed: Seed, index: number): string {
  if (seed.type === "blog") {
    return [
      seed.intro,
      "## The short version",
      seed.points.map((point) => `- ${point}`).join("\n"),
      BLOG_CLOSINGS[index % BLOG_CLOSINGS.length],
    ].join("\n\n")
  }

  if (seed.type === "newsletter") {
    return [
      "Hi there,",
      seed.intro,
      "**In this issue**",
      seed.points.map((point, i) => `${i + 1}. ${point}`).join("\n"),
      "Talk next week.",
    ].join("\n\n")
  }

  return [
    `**Format:** ${seed.format} · ${seed.seconds} seconds`,
    `**Hook:** ${seed.intro}`,
    "**Scenes**",
    seed.points.map((point, i) => `${i + 1}. ${point}`).join("\n"),
    `**Call to action:** ${VIDEO_CTAS[index % VIDEO_CTAS.length]}`,
  ].join("\n\n")
}

export function createSampleContent(now: Date): ContentItem[] {
  const nowMs = now.getTime()

  return SEEDS.map((seed, index) => {
    // Stagger times of day so items created on the same day still sort sensibly.
    const created = nowMs - seed.daysAgo * DAY - (index % 7) * HOUR
    const wasPublished =
      seed.status === "published" ||
      (seed.status === "archived" && seed.views != null)
    // Newsletters and videos go out the next day; posts get a few days of editing.
    const publishDelay = seed.type === "blog" ? 2 + (index % 3) : 1
    const published = wasPublished
      ? Math.min(created + publishDelay * DAY, nowMs - HOUR)
      : null
    const updated = published ?? Math.min(created + 3 * HOUR, nowMs)

    return {
      id: `c${String(index + 1).padStart(3, "0")}`,
      type: seed.type,
      title: seed.title,
      body: buildBody(seed, index),
      model:
        seed.daysAgo > MODEL_SWITCH_DAYS_AGO ? EARLIER_MODEL : CURRENT_MODEL,
      videoUrl: null,
      status: seed.status,
      createdAt: new Date(created).toISOString(),
      updatedAt: new Date(updated).toISOString(),
      publishedAt: published ? new Date(published).toISOString() : null,
      views: seed.views ?? null,
      opens: seed.opens ?? null,
    }
  })
}
