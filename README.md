# CarterTheTownWear: mobile app

Native React Native (Expo) customer app for the CTW clothing shop. Same
Expo SDK, navigation, folder layout, pinned-version policy and theme-file
pattern as `zakumunda-mobile`. Talks to the live shop API at
`https://www.carterthetownwear.com/api`. Orders are sent over WhatsApp;
there is no payment, no checkout record and no customer login.

Built from the "CarterTheTownWear Mobile App (React Native): Handoff"
document.

---

## WhatsApp number

Set in `src/config/env.js` (`WHATSAPP_NUMBER`, international format, digits only).
If the server later gets `GET /api/config` returning `{ "whatsapp_number": "..." }`, the app uses
that instead and keeps this value as the offline fallback.

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
| Shop | Category and brand filters, search, two-column grid, quick add, infinite scroll, pull to refresh, skeleton loaders |
| Cart | Swipe to delete, quantity steppers, delivery note, notes box that rises with the keyboard, pinned total and WhatsApp button |
| More | Currency, delivery and ordering facts, Follow Us (Instagram, TikTok, Facebook, Threads), WhatsApp chat, website, about |

Product detail opens full screen over the tabs (native push, swipe back on
iOS) with a sticky bar: Add to cart, Order on WhatsApp. The currency
switch is a header pill and a bottom sheet, available on every screen.

Rules carried over from the web shop, all in `src/utils/cart.js` and
`src/utils/currency.js` as pure functions with unit tests:

- Quantity 1 to 20 per line, at most 25 distinct lines, notes up to 300 characters. These rules and the
  two WhatsApp messages now match the web source (`client/src/utils/cart.js`, `currency.js`,
  `ProductModal.jsx`) line for line, including `Hi CarterTheTownWear!`, `(brand)` after each name and
  `Total (ZAR): R... + items on request`.
- Cart lines are snapshots. They are refreshed with
  `GET /products?ids=...&limit=50` on app start and every time the Cart
  tab opens: names and prices update, quantities stay, products that no
  longer exist are dropped with "X is no longer available and was
  removed." Network errors during refresh are ignored.
- Totals per currency. A product with no price in the chosen currency
  shows "Price on request", is left out of the total, and the cart says
  how many were left out.
- Currency format: `R1,299.50` and `MK125,000.00`. Rand is the default; the choice is remembered.
  Like the web, a price of 0.00 counts as not set, and old rows with only the legacy `price` use it for Kwacha.
- Brands: each product shows the brand the admin entered (blank means `CTW`, as on the server).
  It appears on cards, the product screen, cart lines and in the WhatsApp messages, and there is a brand
  filter in the Shop (`GET /products/brands`, `?brand=`). The brand row is hidden while only one brand exists.
- The cart and its note survive restarts (AsyncStorage).
- Offline: the last good product list is cached on the device.
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
    │   └── products.js         list / brands / one / by-ids / all-pages + client-side search
    ├── config/
    │   ├── env.js              site URL, WHATSAPP_NUMBER
    │   └── store.js            categories, default currency, page size
    ├── context/
    │   ├── CartContext.js      cart state, persistence, refresh
    │   ├── CurrencyContext.js  currency choice + sheet open/close
    │   └── ConfigContext.js    WhatsApp number (env fallback, /api/config when it exists)
    ├── hooks/
    │   ├── useProductFeed.js   paging, search, offline fallback for Shop
    │   └── useWhatsApp.js      shared WhatsApp handoff + failure modal
    ├── navigation/             RootNavigator (tabs + ProductDetail), TabNavigator
    ├── screens/                Shop, ProductDetail, Cart, More
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

## Photos, delivery and social links (from the web)

- **Photos:** a product can have up to 4. The API returns them as `images` (first = main) and still
  returns `image_url`; `src/utils/photos.js` handles both. Cards show the main photo and an "N photos"
  pill; the product screen has a swipeable gallery with thumbnails. A photo that fails to load shows the
  CTW placeholder for that photo only.
- **Delivery:** "Delivery available" appears on the product screen, in the cart (above the notes box,
  whose label now invites a delivery location) and on More. No fees or locations are promised, same as the web.
- **Follow Us:** More lists the four accounts. The links and the delivery wording live in
  `src/config/store.js` (`SOCIAL_LINKS`, `DELIVERY`) and match the web's `config.js`; change both places
  when a link changes. The Facebook link is a post link on the web too; swap in the page link when the client has it.
- Photos need the web release with migration `003_product_images.sql` on the server. Without it the API
  falls back to one photo per product and the app still works.

---

## Brand assets

Taken from the web repo (`client/public/brand/`): `assets/icon.png` (navy 1024 icon), `adaptive-icon.png`
(cream monogram on transparent; adaptive background `#0F294D`), `splash.png` (monogram), `logo-full.png`
(loading screen) and `logo-mark.png` (More screen).

The committed `android/` project was generated before these existed, so the launcher icons, the
adaptive-icon background colour and the splash logo under `android/app/src/main/res/` were
regenerated by hand from the same files. You do not need `expo prebuild` (which would overwrite your
Android changes). A native rebuild is needed to see them: `npm run android`.

If you ever re-generate `android/` with `npx expo prebuild --clean`, it will rebuild these from
`assets/` and `app.json` by itself.

---

## Still assumptions

1. **App name and ids.** "Carter The Town Wear", `com.carterthetownwear.app`. The Android package id
   cannot change after a Play release.
2. **Search is client-side.** The server still has no `?q=`, so a search loads the whole catalogue
   (50 per request, cached 5 minutes) and filters by name, brand, description and category.
3. **Brand row is hidden when there is only one brand**, to avoid a pointless "All brands / CTW" choice.
   The web always shows it. Change `brandOptions` in `ShopScreen.js` if you want exact parity.
4. **Leftover Kids rows** appear only under All, and are filtered out of category views.
5. **No push notifications, analytics or social links** (the web has none either).

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

## APK for client testing

Your `android/` project builds a standalone release APK (JavaScript bundled inside, no dev server).
PowerShell, from the project folder:

```powershell
cd android
.\gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Result: `android\app\build\outputs\apk\release\app-release.apk`. `arm64-v8a` covers almost every
phone from the last several years and builds only that one CPU type, which is much faster and gives a
smaller file. If a client phone is old or 32-bit and the app will not install, build without the
`-PreactNativeArchitectures` flag to get all four.

Release builds here are signed with the debug keystore. That is fine for testing but cannot be uploaded
to Google Play: for the store, create a real keystore (or use EAS, which manages one) first.
Check `WHATSAPP_NUMBER` before building, because it is compiled in.

To install: send the APK (WhatsApp, Drive, email), open it on the phone and allow "install unknown apps"
for that app when asked. To update later, build again and install over it; keep `versionCode`
in `android/app/build.gradle` higher than the installed one when doing so from a different machine.

Cloud alternative: `eas build -p android --profile preview` produces an APK too.

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

- `npm test`: 43 unit tests pass (photo lists, cart limits and refresh, totals, exact WhatsApp messages with
  brands, price rules including 0.00 and the legacy Kwacha fallback, stored-cart recovery).
- `expo export` bundles for Android and iOS.
- A full-app render test (not shipped; needs `jest-expo`) ran the real app against a mocked API
  shaped like the real one: quick add, Shop brand filter and its reset on category
  change, search by brand, Kwacha fallback for old rows, the exact WhatsApp text for the cart and
  for a single product, the offline retry state, and a saved cart refreshed with one combined
  removal notice.
- The new Android icons and splash were generated and eyeballed as images, not run on a device.

Not tested: anything on a real phone (layout, fonts, haptics, swipe, sheet drag, keyboard in the
cart), WhatsApp opening on a device, and the live API.
