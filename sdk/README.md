# Chat Agent SDK

A React SDK for integrating chat agents with Contentstack and LLM providers.

## Features
- Plug-and-play chat widget for your React app
- Supports Contentstack for content retrieval
- Works with multiple LLM providers (e.g., Groq, OpenAI, Anthropic)
- Easy configuration via provider/model/api keys
- Customizable UI and behavior

## Installation

```sh
npm install chat-agent-sdk-contentstack
```

## Quick Start

```tsx
import { ChatProvider, ChatWidget } from "@chat-agent-sdk-contentstack";

function App() {
  return (
    <ChatProvider
      provider="openai" // e.g., 'openai', 'anthropic', 'groq', etc.
      model="gpt-3.5-turbo" // LLM model name
      apiKey="YOUR_LLM_API_KEY"
      cs_api_key="YOUR_CONTENTSTACK_API_KEY"
      cs_delivery_token="YOUR_CONTENTSTACK_DELIVERY_TOKEN"
      content_type="YOUR_CONTENTSTACK_CONTENT_TYPE"
    >
      <ChatWidget title="Support Bot" status="Ask us anything!" />
    </ChatProvider>
  );
}
```

## Theme Customization

You can customize the chat widget's appearance by passing a `theme` prop to `<ChatProvider />`

```tsx
<ChatProvider
  provider="groq"
  model="llama-3.3-70b-versatile"
  apiKey="YOUR_LLM_API_KEY"
  cs_api_key="YOUR_CONTENTSTACK_API_KEY"
  cs_delivery_token="YOUR_CONTENTSTACK_DELIVERY_TOKEN"
  content_type="tour_package"
  theme={{
    chatbotHeaderColor: "#333333",
    chatbotButtonColor: "#007bff",
    userAvatarBgColor: "#f5a623",
    assistantAvatarBgColor: "#4a90e2",
    sendButtonColor: "#28a745"
  }}
>
  <ChatWidget title="Travel Assistant" status="How can I help you today?" />
</ChatProvider>
```

### Available theme options
- `chatbotHeaderColor`: Header background color
- `chatbotButtonColor`: Main chatbot button color
- `userAvatarBgColor`: User avatar background color
- `assistantAvatarBgColor`: Assistant avatar background color
- `sendButtonColor`: Send button color

## Props

### `<ChatProvider />`
| Prop                  | Type     | Required | Description                                  |
|-----------------------|----------|----------|----------------------------------------------|
| provider              | string   | Yes      | LLM provider name (e.g., 'openai')           |
| model                 | string   | Yes      | LLM model name                               |
| apiKey                | string   | Yes      | API key for the LLM provider                 |
| cs_api_key            | string   | Yes      | Contentstack API key                         |
| cs_delivery_token     | string   | Yes      | Contentstack delivery token                  |
| content_type          | string   | Yes      | Contentstack content type                    |
| theme                 | object   | No       | Theme customization object                   |

### `<ChatWidget />`
| Prop         | Type     | Required | Description                        |
|--------------|----------|----------|------------------------------------|
| title        | string   | No       | Widget header/title                |
| status       | string   | No       | Status message below the title     |

## Customization
- Style the widget using your own CSS or override the default styles.
- Use the `theme` prop on `<ChatProvider />` for custom colors and appearance.
- Pass additional props to customize behavior (see component docs).

## Troubleshooting
- Ensure all API keys and tokens are correct and have proper permissions.
- For Contentstack, make sure the content type and tokens match your stack.

## Support
- For issues, open a GitHub issue in this repo.
- For feature requests, contact the maintainer or submit a PR.

---

## License
MIT
