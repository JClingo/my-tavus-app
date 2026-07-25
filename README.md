# Tavus CVI React App

A responsive video-conversation app built with React, TypeScript, Vite, and
Tavus Conversational Video Interface (CVI).

The landing page creates a Tavus conversation and passes the returned
`conversation_url` to Tavus's generated `<Conversation>` component. The
component then joins the call and provides video, audio, device selection,
screen sharing, chat, and closed captions.

## Prerequisites

- Node.js 20 or newer
- npm
- A [Tavus](https://www.tavus.io/) account and API key
- A Tavus replica/face ID and persona/PAL ID, or access to the defaults

Camera and microphone permissions are required to participate in a
conversation.

## Getting started

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Open `.env` in this project directory and provide your Tavus credentials:

   ```dotenv
   VITE_TAVUS_API_KEY=your_api_key_here
   VITE_REPLICA_ID=r90bbd427f71
   VITE_PERSONA_ID=pcb7a34da5fe
   ```

   `VITE_REPLICA_ID` and `VITE_PERSONA_ID` may be changed to IDs from your
   Tavus account. The values above are also used as the application's
   fallbacks.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite, normally
   [http://localhost:5173](http://localhost:5173), and select **Start
   conversation**.

The `.env` file is intentionally ignored by Git. Keep it in the project root,
next to `package.json`, so Vite can load it.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reloading. |
| `npm run build` | Type-check the app and create a production build in `dist/`. |
| `npm run lint` | Run Oxlint across the project. |
| `npm run preview` | Serve the production build locally for verification. |

## How the integration works

1. `src/App.tsx` sends a `POST` request to
   `https://tavusapi.com/v2/conversations`.
2. The request supplies `face_id` and `pal_id` using the Vite environment
   variables.
3. Tavus returns a `conversation_url`.
4. React stores that URL and renders:

   ```tsx
   <CVIProvider>
     <Conversation
       conversationUrl={conversationUrl}
       onLeave={() => setConversationUrl(null)}
     />
   </CVIProvider>
   ```

5. Leaving the call clears the URL and returns the user to the landing page.

API failures and missing conversation URLs are shown on the landing page
instead of leaving the interface in a loading state.

## Project structure

```text
my-tavus-app/
├── .env                         # Local Tavus configuration (not committed)
├── cvi-components.json          # Tavus component generator configuration
├── src/
│   ├── App.tsx                  # Conversation creation and page state
│   ├── App.css                  # Landing page and call-container styling
│   ├── index.css                # Global styles
│   └── components/cvi/
│       ├── components/          # Generated Tavus CVI UI components
│       └── hooks/               # Generated call and device hooks
└── package.json
```

The files under `src/components/cvi/` were copied into the project by the
Tavus CVI UI CLI, so they can be customized locally. Re-running an `add`
command may update generated files; review those changes before keeping them.

To initialize or restore the generated CVI components:

```bash
npx @tavus/cvi-ui@latest init
npx @tavus/cvi-ui@latest add conversation
```

## Production security

Every Vite variable beginning with `VITE_` is bundled into client-side
JavaScript and is visible to users. The current browser-side API request is
convenient for local development and follows this project's requested
integration pattern, but it exposes `VITE_TAVUS_API_KEY`.

For a production deployment, create conversations through a server endpoint
and keep the Tavus API key in a server-only environment variable. Return only
the resulting `conversation_url` to the browser. Tavus documents server
helpers for this purpose in its
[CVI embedding guide](https://docs.tavus.io/sections/integrations/embedding-cvi).

## Troubleshooting

### The conversation cannot be created

- Confirm that `VITE_TAVUS_API_KEY` contains a valid key.
- Confirm that the replica and persona IDs exist and are available to the
  account associated with the key.
- Restart `npm run dev` after changing `.env`; Vite reads environment variables
  when the server starts.
- Check the browser's developer console and Network panel for the Tavus API
  response.

### The call area is blank or cannot access devices

- Allow camera and microphone access in the browser.
- Use `localhost` or HTTPS; browsers restrict media devices on insecure
  origins.
- Verify that another application is not exclusively using the selected
  camera or microphone.
- Ensure the conversation has not expired before attempting to join it.

### Type or generated-component errors appear

Run:

```bash
npm install
npm run build
npm run lint
```

The application currently uses React 19, Vite 8, Daily React, Daily JS, and
Jotai. The exact installed versions are recorded in `package-lock.json`.

## Further reading

- [Embed Tavus CVI](https://docs.tavus.io/sections/integrations/embedding-cvi)
- [Create Conversation API](https://docs.tavus.io/api-reference/conversations/create-conversation)
- [Vite environment variables](https://vite.dev/guide/env-and-mode)
