import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'hanc-ai-pill-call': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'agent-id': string
        theme?: string
        'theme-mode'?: 'auto' | 'dark' | 'light'
        'voice-service-url'?: string
        'button-start-text'?: string
        'button-connecting-text'?: string
        'button-end-text'?: string
        'orb-size'?: number
      }
    }
  }
}
