import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Newt',
  description: 'A beginner-friendly DSL for Discord bots.',
  appearance: 'dark',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }]
  ],
  themeConfig: {
    logo: '/newt-logo.png',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Quickstart', link: '/quickstart' },
      { text: 'Guides', link: '/guides/your-first-bot' },
      { text: 'Reference', link: '/reference' },
      { text: 'Examples', link: '/examples' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Your First Bot', link: '/guides/your-first-bot' },
          { text: 'Quickstart', link: '/quickstart' },
          { text: 'Installation', link: '/installation' },
          { text: 'Setting Up Your Computer', link: '/getting-started/setup' },
          { text: 'Understanding Errors', link: '/getting-started/understanding-errors' },
          { text: 'Token Security', link: '/security' },
          { text: 'Deployment', link: '/deployment' }
        ]
      },
      {
        text: 'Guides',
        items: [
          { text: 'Building Interactive Bots', link: '/guides/building-interactive-bots' },
          { text: 'Building Moderation Bots', link: '/guides/building-moderation-bots' }
        ]
      },
      {
        text: 'Learning Path',
        items: [
          { text: '1. Events', link: '/reference/handlers' },
          { text: '2. Conditions', link: '/reference/statements#conditional-logic' },
          { text: '3. Actions', link: '/reference/statements#actions' },
          { text: '4. State', link: '/reference/statements#data-persistence' },
          { text: '5. Iteration', link: '/reference/statements#iteration' }
        ]
      },
      {
        text: 'Language Reference',
        items: [
          { text: 'Bot Configuration', link: '/reference/bot-config' },
          { text: 'Event Handlers', link: '/reference/handlers' },
          { text: 'Statements', link: '/reference/statements' },
          { text: 'Expressions', link: '/reference/expressions' }
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Hello World', link: '/examples/hello-world' },
          { text: 'Points System', link: '/examples/points-bot' },
          { text: 'Welcome Bot', link: '/examples/welcome-bot' },
          { text: 'Moderation Bot', link: '/examples/moderation-bot' }
        ]
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Learning Philosophy', link: '/learning-philosophy' },
          { text: 'Programming Concepts', link: '/concepts' },
          { text: 'Interpreter Capabilities', link: '/interpreter-capabilities' }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'Graduating to Discord.js', link: '/learning/graduating-to-discordjs' },
          { text: 'Roadmap', link: '/roadmap' },
          { text: 'Troubleshooting', link: '/troubleshooting' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/newt-dev-sudo/newt' },
      { icon: 'discord', link: 'https://discord.gg/cXFCVz3VcR' }
    ]
  }
})
