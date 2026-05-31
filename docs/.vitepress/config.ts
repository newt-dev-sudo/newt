import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Newt',
  description: 'Small script, big bot. A beginner-friendly DSL for Discord bots.',
  themeConfig: {
    nav: [
      { text: 'Quickstart', link: '/quickstart' },
      { text: 'Reference', link: '/reference' },
      { text: 'Examples', link: '/examples' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Quickstart', link: '/quickstart' },
          { text: 'Installation', link: '/installation' },
          { text: 'Token Security', link: '/security' },
          { text: 'Deployment', link: '/deployment' }
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
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/newt-lang/newt' }
    ]
  }
})
