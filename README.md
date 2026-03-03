# @Q Experiment

A prototype-level platform for on-the-fly team collaboration tools

👉 [**Read the article**](https://labs.google/code/experiments/atq)

## Building locally

1. Create a Firebase project with Realtime Database and Auth enabled

2. Make a `.env` file at the root, as a copy of [`.env.example`](./.env.example), filling out the necessary field(s)

3. Install dependencies and start the Vite server:
    ```bash
    $ npm install
    $ npm run dev
    ```

## Technical components

- **Realtime multiplayer** - powered by [Firebase Realtime Database](https://firebase.google.com/docs/database) and Auth.
- **On-the-fly app generation** - simplified coding agent powered by Gemini, along with an in-browser runtime powered by [`esbuild-wasm`](https://www.npmjs.com/package/esbuild-wasm) and inspired by [JSNotebook](https://github.com/tschoffelen/jsnotebook).
