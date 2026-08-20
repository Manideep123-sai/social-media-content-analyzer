export interface SampleItem {
  id: 'linkedin' | 'x' | 'pdf' | 'image';
  title: string;
  sourceType: 'text' | 'pdf' | 'image' | 'sample';
  content: string;
  description: string;
}

export const SAMPLES: Record<string, SampleItem> = {
  linkedin: {
    id: 'linkedin',
    title: 'LinkedIn Thought Leadership Post',
    sourceType: 'sample',
    description: 'A professional growth post with spacing, hook, and discussion CTA.',
    content: `Stop optimizing for short-term vanity metrics.

Here is what 5 years of scaling engineering teams taught me:

1. Code velocity means nothing if you build the wrong feature.
2. The best engineers spend 40% of their time reading code and communicating, not just typing.
3. Automated testing isn't overhead—it is your team's velocity insurance.

What strategy has worked best for your engineering team this year? Drop your thoughts below! 👇

#SoftwareEngineering #Leadership #TechTrends #Productivity`
  },

  x: {
    id: 'x',
    title: 'X / Twitter High-Impact Hook',
    sourceType: 'sample',
    description: 'A punchy tweet under 280 characters with curiosity hook.',
    content: `90% of developers make this one mistake when building modern apps:

They optimize backend queries before understanding user access patterns.

Always profile in production first.

Agree or disagree? #WebDev #Coding`
  },

  pdf: {
    id: 'pdf',
    title: 'Document Extract: Social Media Blueprint',
    sourceType: 'pdf',
    description: 'Simulated multi-section social strategy document.',
    content: `Social Media Growth Framework: 2026 Edition

Why most content strategies fail within 30 days:
Most creators focus on volume instead of retention and clarity.

Key Principles to Remember:
• Hook in the first 3 seconds with a contrarian truth or compelling statistic.
• Keep paragraph blocks under 3 lines for effortless mobile scanning.
• Always conclude with a single, clear question to drive comments and community discussion.

Save this framework for your next campaign planning session!

#ContentStrategy #Marketing #GrowthHacking`
  },

  image: {
    id: 'image',
    title: 'OCR Scanned Image Draft',
    sourceType: 'image',
    description: 'Simulated OCR text extraction from a scanned notes document.',
    content: `Unpopular opinion: You don't need a 10-person marketing team to grow your audience.

Here is the simple 3-step formula we used to reach 100k readers:
- Write daily about what you are building.
- Share both your wins and painful mistakes transparently.
- Ask questions that your peers actually care about answering.

Which of these 3 steps do you find hardest to maintain consistently?

#CreatorEconomy #BuildInPublic #Startup`
  }
};
