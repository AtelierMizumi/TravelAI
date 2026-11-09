# TravelAI universal application

This directory is the shared Web, Android and iOS client. Run the commands and configure the API URLs described in the repository README.

Routes are in `src/app`, reusable native components are in `src/components`, and shared API/session/recognition contracts are in `src/services`. `src/context/auth.tsx` restores server-authenticated identity, storing the opaque token in native SecureStore or Web local storage. Recognition is implemented in `src/screens/recognition.tsx` and exposed at the two existing Web recognition URLs.

Run `npm run lint`, `npm run typecheck` and `npm test` before shipping changes. `npx expo start` regenerates typed routes when adding or removing route files. Native message updates use the authenticated STOMP endpoint with polling for recovery after missed events. SIMULATED payment retries keep their operation identifier when the result is unknown.

Admin inventory configuration requires explicit cutoff and hold values. Advanced departure/physical-room lists are entered as JSON. Their contract matches `BookingContracts.java`. The editor describes each required field and the server validates configuration before opening sales.
