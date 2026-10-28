# CarterTheTownWear: mobile app

Native React Native (Expo) customer app for the CTW clothing shop. Same
Expo SDK, navigation, folder layout, pinned-version policy and theme-file
pattern as `zakumunda-mobile`. Talks to the live shop API at
`https://www.carterthetownwear.com/api`. Orders are sent over WhatsApp;
there is no payment, no checkout record and no customer login.

Built from the "CarterTheTownWear Mobile App (React Native): Handoff"
document.

---

## Before you run it: one required edit

Open `src/config/env.js` and set the client's WhatsApp number:

```js
export const WHATSAPP_NUMBER = '27821234567'; // international format, digits only
```

The API does not expose the number, and the web build bakes it in, so the
app needs it too. While it is empty, every "Order on WhatsApp" button
shows a notice instead of opening WhatsApp. If you later add
`GET /api/config` (see "Server additions"), the app picks the number up
from there by itself and this value becomes the offline fallback.

---

## Run it

PowerShell, in this folder:

```powershell
npm install
npm run go        # Expo Go: scan the QR code with the Expo Go app
npm test          # unit tests for the cart, currency and WhatsApp logic
```

`npm run go` is `expo start --go`. This app uses no custom native code, so
Expo Go runs everything. `expo-dev-client` is installed to match your
Zakumunda setup (`eas.json` has the `development` profile), which makes a
plain `npx expo start` aim at a dev build instead; use `npm run go` to
force Expo Go.

No local backend and no IP address to configure: the API is already live
over HTTPS and native apps ignore CORS.

---

## What is in the app

| Tab | What it does |
| --- | --- |
| Home | Hero, category tiles, three random picks (pull to refresh for new ones), how ordering works |
| Shop | Category chips, search, two-column grid, infinite scroll, pull to refresh, skeleton loaders |
| Cart | Swipe to delete, quantity steppers, note box that rises with the keyboard, pinned total and WhatsApp button |
| More | Currency, WhatsApp chat, website, about |

Product detail opens full screen over the tabs (native push, swipe back on
iOS) with a sticky bar: Add to cart, Order on WhatsApp. The currency
switch is a header pill and a bottom sheet, available on every screen.

Rules carried over from the web shop, all in `src/utils/cart.js` and
`src/utils/currency.js` as pure functions with unit tests:

- Quantity 1 to 20 per line, at most 25 distinct lines, notes up to 300 characters.
- Cart lines are snapshots. They are refreshed with
  `GET /products?ids=...&limit=50` on app start and every time the Cart
  tab opens: names and prices update, quantities stay, products that no
  longer exist are dropped with "X is no longer available and was
  removed." Network errors during refresh are ignored.
- Totals per currency. A product with no price in the chosen currency
  shows "Price on request", is left out of the total, and the cart says
  how many were left out.
- Currency format: `R1,299.50` and `MK125,000.00`. Rand is the default;
  the choice is remembered.
- Branding: the UI only ever shows `CTW`. The API's `brand` field is
  dropped when a product is parsed.
- The cart and its note survive restarts (AsyncStorage).
- Offline: the last good product list and picks are cached on the device.
  When a request fails, the app serves the cache with an "offline" banner.
  With nothing cached, it shows a calm retry screen, not an error wall.
- Errors: the app never assumes a response body is JSON (a proxy can
  return HTML); malformed bodies are treated as a failed request.

---

## Project structure

```
ctw-mobile/
├── App.js                      entry: fonts, providers, splash, navigation
├── app.json                    Expo config (name, icon, splash, ids)
├── eas.json                    EAS build profiles (same as Zakumunda)
├── .npmrc                      legacy-peer-deps=true (same reason as Zakumunda)
├── assets/                     icon, adaptive icon, splash, logo (placeholders, see below)
└── src/
    ├── api/
    │   ├── client.js           axios instance, error helpers (no auth: customers have no accounts)
    │   └── products.js         list / picks / one / by-ids / all-pages + client-side search
    ├── config/
    │   ├── env.js              site URL, WHATSAPP_NUMBER
    │   └── store.js            categories, default currency, page size
    ├── context/
    │   ├── CartContext.js      cart state, persistence, refresh
    │   ├── CurrencyContext.js  currency choice + sheet open/close
    │   └── ConfigContext.js    WhatsApp number (env fallback, /api/config when it exists)
    ├── hooks/
    │   ├── useProductFeed.js   paging, search, offline fallback for Shop
    │   ├── usePicks.js         home picks + cache
    │   └── useWhatsApp.js      shared WhatsApp handoff + failure modal
    ├── navigation/             RootNavigator (tabs + ProductDetail), TabNavigator
    ├── screens/                Home, Shop, ProductDetail, Cart, More
    ├── components/             ProductCard, CartLine, CurrencySheet, buttons, skeletons, states
    ├── theme/theme.js          colours, fonts, spacing, radius, shadow
    └── utils/
        ├── cart.js             cart rules + WhatsApp message builders
        ├── currency.js         price parsing + formatting
        ├── product.js          API product -> app product
        ├── whatsapp.js / whatsappUrl.js
        ├── imageUrl.js, haptics.js, cache.js
        └── __tests__/          Jest tests
```

**Design.** Near-black `#0D0D0D` and `#1A1A1A` surfaces, gold `#D4AF37`
accent, thin gold-tinted borders, gold gradient primary button, gold outline
secondary button, gold pill filters. Playfair Display for headings and
prices, DM Sans for body, DM Mono for small uppercase labels. Only the five
weights actually used are bundled (each is imported from its own path; the
package root would pull in every weight and italic, about 10 MB more).

**Fonts and `fontWeight`.** Never combine these font families with a
`fontWeight` style: each weight is a separate font file, and Android
resolves a family plus weight pair to the wrong file. Pick the right
family from `fonts` in `theme.js` instead.

---

## Assumptions to confirm (the open questions from the handoff, section 10)

These were settled with defaults so the app could be built. All are cheap to change.

1. **App name and ids.** Name "Carter The Town Wear", slug `ctw-mobile`,
   Android package and iOS bundle id `com.carterthetownwear.app`. Change them in
   `app.json` before the first store build; the Android package id cannot change after release.
2. **Platforms.** Code is cross-platform and both ids are set. Only Android was
   built and tested in the Zakumunda project; iOS needs an Apple Developer
   account (question 6) before it can be built or published.
3. **Admin area.** Not included. Customer-only for version 1, as the handoff describes.
4. **Brand assets are placeholders.** The icon, adaptive icon, splash and in-app logo are a
   gold "CTW" monogram on `#0D0D0D`, generated because no logo file was provided. Replace
   `assets/icon.png`, `adaptive-icon.png`, `splash.png` and `logo.png` with the real logo
   (keep the adaptive icon's artwork inside the centre 66%).
5. **Search is client-side.** The server has no `?q=` yet, so a search loads every page
   (50 per request, cached 5 minutes) and filters by name, description and category on the
   device. Fine for a few hundred products. Replace `fetchAllProducts` use in
   `useProductFeed.js` with a `?q=` call once the server supports it.
6. **Message wording the doc did not specify.** The cart message is exactly the documented
   format. Three details are my choice and should be matched against the web
   `cart.js`: (a) a line with no price reads `2 x Price on request`, (b) a note
   `N item(s) priced on request, not included in the total.` goes under the total, and (c) the
   total line is omitted when every line is on request. The single-product message is:
   `Hi CTW! I'm interested in:` / `*Name* (Category)` / `Price (ZAR): R1,200.00` / `Please confirm availability.`
7. **Prices of 0.00** are treated as real prices, only null means "Price on request". If old rows
   hold 0.00 instead of null, change `parsePrice` in `src/utils/currency.js`.
8. **Leftover Kids rows** appear only under All. They are filtered out of category views and Home picks.
9. **No push notifications, analytics or crash reporting** yet (questions 10, section 9).
10. **No social links** on the More screen: none were given.

---

## Server additions (optional, handoff section 9)

Nothing in the app needs a server change to work today. These make it better:

- `GET /api/config` returning `{ "whatsapp_number": "27821234567" }` (more keys are ignored).
  The app already calls it on launch, caches a good answer, and ignores a 404 or an HTML
  fallback page. This is how a number change ships without a store release.
- `GET /api/products?q=` for server-side search.
- Image thumbnails if list screens feel heavy on mobile data.

These go through your normal web-repo deploy routine (zip, migration step, `bash deploy/update.sh`).

---

## Release

```powershell
npm install -g eas-cli
eas login
eas init                                    # writes the EAS project id into app.json
eas build -p android --profile preview      # installable APK for client testing
eas build -p android --profile production   # AAB for Google Play
eas submit -p android --profile production  # needs a Play Console account and service account key
```

iOS: `eas build -p ios --profile production`, which needs the client's (or your)
Apple Developer account. Do not put signing keystores, certificates, API keys or
`.env` files in the repository.

Before a store build, set `WHATSAPP_NUMBER`, replace the placeholder icons, and
set the real app name and package id.

---

## What was verified, and what was not

Done from the build environment:

- `npm test`: 31 unit tests pass (cart limits, totals, refresh and removal, exact WhatsApp
  message, price parsing and formatting, stored-cart recovery, WhatsApp URLs).
- `expo export` bundles cleanly for both Android and iOS through Metro (2,545 modules).
- A full-app render test (not shipped; it needs `jest-expo`) drove the real app with a mocked API:
  splash to Home, picks, "Price on request", category jump and filtering, search, product
  detail, add to cart twice, cart total, the WhatsApp deep link and its decoded message, the
  currency switch repricing everything, the offline retry state, and a persisted cart being
  refreshed and a removed product dropped with its notice.

Not tested, because there is no phone or emulator here:

- Real layout, spacing, fonts and the look of the screens on a device.
- Haptics, swipe-to-delete feel, the bottom sheet drag, pull to refresh.
- Keyboard behaviour in the cart (notes box, pinned bar). Android edge-to-edge is switched on
  in `app.json`, so the cart uses `KeyboardAvoidingView` with padding on both platforms.
  Check this on a real Android phone first.
- WhatsApp opening on a real device, with WhatsApp installed and not installed.
- The live API: the app was built from the handoff contract, not run against the production server.
- The web `cart.js` and `currency.js` were not available, so the cart rules follow the document,
  not the source. Compare the two before release (see assumption 6).
