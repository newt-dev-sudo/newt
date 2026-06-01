import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Newt',
  description: 'A beginner-friendly DSL for Discord bots.',
  appearance: 'dark',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }]
  ],
  themeConfig: {
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Quickstart', link: '/quickstart' },
      { text: 'Reference', link: '/reference' },
      { text: 'Examples', link: '/examples' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Setting Up Your Computer', link: '/getting-started/setup' },
          { text: 'Understanding Errors', link: '/getting-started/understanding-errors' },
          { text: 'Learning Philosophy', link: '/learning-philosophy' },
          { text: 'Programming Concepts', link: '/concepts' },
          { text: 'Quickstart', link: '/quickstart' },
          { text: 'Installation', link: '/installation' },
          { text: 'Token Security', link: '/security' },
          { text: 'Deployment', link: '/deployment' },
          { text: 'Roadmap', link: '/roadmap' },
          { text: 'Troubleshooting', link: '/troubleshooting' }
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
        text: 'Learning',
        items: [
          { text: 'Graduating to Discord.js', link: '/learning/graduating-to-discordjs' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/newt-dev-sudo/newt' },
      { icon: 'discord', link: 'https://discord.gg/cXFCVz3VcR' }
    ]
  }
})
