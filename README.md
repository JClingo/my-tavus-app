# Still — Guided Breathwork with Vincent

A simple, responsive web app that helps beginners learn box breathing in a
live, one-to-one session with Vincent, a Tavus PAL. It is built with React,
TypeScript, Vite, and Tavus Conversational Video Interface (CVI).

The landing page asks for the participant's preferred name, creates a Tavus
conversation, and passes the returned `conversation_url` to Tavus's generated
`<Conversation>` component. The component then joins the call and provides
video, audio, device selection, screen sharing, chat, and closed captions.

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
   VITE_PERSONA_ID=pcde5abf91e4
   ```

   `VITE_PERSONA_ID` defaults to Vincent's PAL (`pcde5abf91e4`).
   `VITE_REPLICA_ID` identifies the face used by that PAL. Both may be changed
   to compatible IDs from your Tavus account.

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

1. The participant enters the name Vincent should use.
2. `src/App.tsx` sends a `POST` request to
   `https://tavusapi.com/v2/conversations`.
3. The request supplies `face_id`, `pal_id`, and a `conversational_context`
   string containing the participant's validated preferred name. Tavus appends
   this per-session context to Vincent's PAL prompt.
4. Tavus returns a `conversation_url`.
5. React stores that URL and renders:

   ```tsx
   <CVIProvider>
     <Conversation
       conversationUrl={conversationUrl}
       onLeave={() => setConversationUrl(null)}
     />
   </CVIProvider>
   ```

6. Leaving the call clears the URL and returns the user to the landing page.

API failures and missing conversation URLs are shown on the landing page
instead of leaving the interface in a loading state.

## Session telemetry and summaries

During a call, the app listens to Tavus interaction events delivered through
Daily app messages. It keeps an in-memory session record containing:

- Session duration and total event count
- User and Vincent utterance counts
- Speaking duration for each participant
- Interrupted turn count
- Arguments emitted by Vincent's configured `submit_post_call_summary` tool

After the call closes, the app displays those metrics and any PAL summary
payload. It also polls `GET /v2/conversations/{id}?verbose=true` briefly for
the finalized transcript, shutdown reason, and Raven perception analysis.
Post-call processing is asynchronous, so those fields may remain unavailable
if Tavus has not completed them within the polling window or the PAL does not
emit the configured summary tool.

Telemetry currently lives only in React memory and is discarded on refresh.
Persist it through a consent-aware backend if historical reporting is needed.
Transcripts and perception analysis can contain sensitive personal data; do
not persist or transmit them without an appropriate privacy policy and user
consent.

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
