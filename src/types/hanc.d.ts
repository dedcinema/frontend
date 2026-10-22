import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'hanc-ai-inline-call': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'agent-id': string
        theme?: string
        'voice-service-url'?: string
      }
    }
  }
}
