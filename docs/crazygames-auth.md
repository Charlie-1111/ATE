# CrazyGames user ↔ ATE backend

ATE links CrazyGames Users to game accounts via the User module JWT.

**Form answer:** Yes — linked to a game account on the game’s backend, associated with the CrazyGames User.

## Compliance

On CrazyGames embed:

- **Auto-login** via `getUserToken()` → `POST /api/auth/crazygames` (no email/Google UI)
- Email `/login` and `/signup` are blocked/redirected home
- No in-game logout for CG-linked sessions
- **`muteAudio`** from `SDK.game.settings` overrides in-game mute

Outside CrazyGames, email signup still works.

## Flow

1. Load `crazygames-sdk-v3.js` (see `client/index.html`).
2. `SDK.init()` then silent `SDK.user.getUserToken()`.
3. `POST /api/auth/crazygames` with `{ token }`.
4. Server verifies JWT with https://sdk.crazygames.com/publicKey.json (RS256).
5. Upserts `crazygames_accounts` (`crazygames_id` → `user_id` = `cg_<id>`).
6. Returns ATE JWT; client stores via `useUserStore.applyAuth`.

## Test on CrazyGames QA

- `?user_response=user1`
- `?token_response=user1`
- `?muteAudio=true`

## Migrations

- `004_crazygames_accounts.js`
- `005_drop_character_purchases.js`

Run: `npm run db:migrate`
