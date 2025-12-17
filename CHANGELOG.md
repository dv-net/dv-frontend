# Changelog

## [Unreleased]

## [1.0.27] - 2025-12-17

- fix: removed date_to and date_from when requesting data from the exchange by slug on the withdrawals and exchanges page [DV-4006]

## [1.0.26] - 2025-12-17

- change: new view of deposit summary on the dashboard [DV-3991]
- feat: added saving of bar state in PU [DV-3944]

## [1.0.25] - 2025-12-03

- fix: fixed the missing value from env github in the final build [DV-3929]

## [1.0.24] - 2025-12-02

- feat: blockchain details have been added to the dashboard [DV-3913]

## [1.0.23] - 2025-12-01

- feat: added tokens from the exchange to the exchange and withdrawal page [DV-3890]
- change: change deposit [DV-3894]
- change: in the mobile version of the payment form, the block has been moved down [DV-3892]

## [1.0.22] - 2025-11-28

- change: unified payment interface in Tron and EVM [DV-3856]
- feat: added walletConnect for EVM [DV-3767]
- change: changed a block with recent payments [DV-3828]

## [1.0.21] - 2025-11-18

- feat: added a block with recent payments [DV-3785]
- change: address search has been changed form [DV-3741]
- fix: fixed the issue with scrolling on the payment form [DV-3748]
- feat: added saving of scroll position after returning via breadcrumbs [DV-3684]
- feat: added skeleton in hot wallets [DV-3774]

## [1.0.20] - 2025-11-11

- feat: added a trial warning when registering at cloud.dv.net [DV-3774]
- feat: chain logos have been added to the payment form [DV-3771]
- feat: added payment okx & tronLink [DV-3669]

## [1.0.19] - 2025-10-27

- update: update icons [DV-3646]

## [1.0.18] - 2025-10-22

- feat: added a section - other exchange services [DV-3630]
- change: change search payment form [DV-3574]
- feat: added animation to the login page [DV-3586]
- feat: added audio payment form [DV-3522]
- feat: added animation shield [DV-3481]
- feat: added a 2FA trigger to the input [DV-3559]

## [1.0.17] - 2025-10-13

- change: change exchange rates [DV-3537]

## [1.0.16] - 2025-10-08

- update: automated the display of coins  [DV-3521]
- change: change payment form [DV-3513]

## [1.0.15] - 2025-10-06

- feat: added lottie animation [DV-3486]
- feat: added whitelists [DV-3433]
- change: change payment form [DV-3458]

## [1.0.14] - 2025-09-30

- update: design review [DV-3422]
- update: re-requesting payment form information when changing the language [DV-3432]

## [1.0.13] - 2025-09-17

- feat: added display of logs [DV-3371]
- change: payment form design changes [DV-3380]
- feat: added notification settings in the store [DV-3383]
- change: changed the receipt screen in the payment form [DV-3364]
- feat: added icons of new coins [DV-3348]

## [1.0.12] - 2025-09-15

- change: changed payment form [DV-3357]

---
## [1.0.11] - 2025-09-10

- change: changed behavior in email confirmation [DV-3323]
- change: adaptation of the payment form for mobile devices [DV-3311]

---
## [1.0.10] - 2025-09-05

- change: change payment form
  
---
## [1.0.9] - 2025-09-01

- update: change ci
  
---
## [1.0.8] - 2025-08-28

- update: add ci build for dv-merchant

---
## [1.0.7] - 2025-08-28

- fix: fix rules for withdrawal from the HTX [DV-3299]

---
## [1.0.6] - 2025-08-28

- change: changed payment form icon [DV-3279]
- change: changed address book [DV-3203]

---
## [1.0.5] - 2025-08-27

- change: changed the names of address types in the address book [DV-3244]
- change: removed duplicate currencies [DV-3243]
- feat: added transaction sorting [DV-3204]

---
## [1.0.4] - 2025-08-26

- change: changed transfer history [DV-3185]
- feat: added address book [DV-2672]
- change: changed payer form [DV-3129]
- fix: fixed translations [DV-3072]
- change: changed settings [DV-3057]
- fix: prevented translation of 'max' and 'min' [DV-3068]
- fix: fixed translation issues [DV-2943]
- fix: fixed layout for multiple languages [DV-3075]
- fix: fixed additional translation issues [DV-3070]
- feat: added select-all option for processing wallets [DV-2487]
- fix: fixed documentation route [DV-3104]
- fix: fixed text [DV-2863]
- change: updated select withdrawal wallet modal [DV-3133]
- feat: made the Telegram unpin button functional [DV-3144]
- feat: added interactive icons and no-select clickable elements [DV-3168]
- feat: added empty hot wallets mode [DV-3182]
- fix: fixed hot wallet key download logic [DV-3138]
- fix: fixed Telegram connection logic [DV-3195]
- fix: fixed confirm email initialization logic [DV-3193]
- update: prepared for open-source release [DV-3208]

---
## [1.0.3] - 2025-08-05

- feat: added functionality to save page position and number on the history page [DV-3034]
- feat: added statistics setting [DV-2970]
- change: changed translations [DV-2943]
- update: animated the send icon and fixed the bars container [DV-2854]
- fix: fixed Tron processing settings tab text [DV-3002]
- fix: fixed cursor for non-clickable rows [DV-3003]
- feat: added toaster notifications and redirects [DV-3033]
- fix: fixed login notification [DV-3029]
- feat: added a request when clicking the confirm email item in the menu [DV-2950]
- update: upgraded withdrawal validation from processing [DV-3042]

---
## [1.0.2] - 2025-07-29

- feat: added channel search [DV-2976]
- fix: fixed native balance [DV-2922]
- fix: fixed icon [DV-2812]
- feat: added email search [DV-2918]
- change: changed chart [DV-2852]
- feat: added mail template rendering [DV-2831]
- change: changed installer [DV-2838]
- feat: added AML (Anti-Money Laundering) functionality [DV-2797]
- feat: added withdrawal processing button [DV-2303]
- feat: displayed available backend and processing versions for installation [DV-2603]
- feat: added filter for selected token [DV-2795]
- fix: fixed modal window for exchange changes [DV-2913]
- fix: fixed bugs in the library [DV-2895]
- update: removed unused translations and fixed dashboard cards [DV-2915]
- fix: fixed exchanges link [DV-2927]

---
## [1.0.1] - 2025-07-16

- fix: fixed seed phrase [DV-2801]

---
## [1.0.0] - 2025-07-15

- feat: added seed phrase functionality [DV-2746]
- fix: fixed dashboard card [DV-2758]
- update: updated legal documents [DV-2784]

---
## [0.2.35] - 2025-07-10

- feat: added a switch in hot wallets [DV-2730]
- change: changed deposits [DV-2542]
- feat: added save scroll position [DV-2654]
- fix: fixed hover checkbox bug [DV-2551]
- fix: fixed webmanifest [DV-2559]
- fix: fixed close modal bug [DV-2727]
- fix: fixed link to dv.docs [DV-2734]
- change: changed the `my.DV` registration page [DV-2572]
- feat: added viewing of untrusted emails [DV-2745]

---
## [0.2.34] - 2025-07-07

- feat: added explorer links [DV-2712]

---
## [0.2.33] - 2025-07-07

- change: changed dashboard [DV-2542]
- fix: fixed selection in withdrawal rules [DV-2701]
- update: updated library [DV-2695]
- update: upgraded registration password validation [DV-2459]
- change: redesigned the login/registration page [DV-2464]

---
## [0.2.32] - 2025-07-03

- fix: fixed chart [DV-2664]
- update: updated login animations [DV-2589]
- fix: fixed tooltip instruction [DV-2668]

---
## [0.2.31] - 2025-07-03

- fix: fixed chart and payer form [DV-2664]
- fix: fixed Russian text [DV-2522]

---
## [0.2.30] - 2025-07-02

- feat: added Tron chart statistics [DV-2593]

---
## [0.2.29] - 2025-07-01

- feat: added save email for the payer form [DV-2549]

---
## [0.2.28] - 2025-07-01

- fix: fixed deposit addresses [DV-2608]
- change: changed chart [DV-2594]
- change: changed currencies in the store [DV-2543]
- fix: fixed minimum amount cell [DV-2495]
- refactor: changed email code sending logic and refactored [DV-2320]
- update: added word-breaks and non-breaking spaces in the history table [DV-2470]
- update: added a timeout for the tooltip instruction [DV-2441]
- feat: added legal documents to the registration page [DV-2457]

---
## [0.2.27] - 2025-06-25

- change: changed icons [DV-2544]
- update: optimized translations [DV-2556]
- change: changed the form for creating a payment [DV-2520]
- feat: added a new email [DV-2468]
- fix: fixed active exchange tabs [DV-2525]
- feat: added saved active tab [DV-2501]
- feat: added a "send test email" button [DV-2509]
- fix: fixed date format [DV-2452]
- fix: fixed links to connect exchanges [DV-2506]
- change: added new styles for the exchange connection tooltip and changed its view logic [DV-2515]
- update: vite updated [DV-2512]

---
## [0.2.26] - 2025-06-20

- change: changed settings [DV-2372]
- change: changed email template header and footer [DV-2414]
- fix: fixed OTP [DV-2438]
- change: centered the "Connect Telegram" button [DV-2422]
- change: added a red outline for blocked exchanges [DV-2450]
- fix: fixed endless updating on the update page [DV-2478]

---
## [0.2.25] - 2025-06-18

- fix: fixed exchange [DV-2418]
- change: deleted slug in the store [DV-2405]
- change: changed email verification [DV-2299]
- feat: added an exchange check when connecting it [DV-2382]
- feat: added locale in redirect to docs [DV-2322]
- change: removed HTML from notifications [DV-2356]
- fix: fixed exchange rules switch behavior [DV-2366]
- feat: turned on two languages [DV-2374]
- fix: fixed "transactions" translation [DV-2376]
- feat: added translations for time-date format selection [DV-2351]
- feat: added a link to instructions on the exchange connect page [DV-2315]
- fix: fixed "dashboard" in Russian, and language select title showing in English [DV-2379]
- fix: fixes after review [DV-2300]
- feat: added transactions [DV-2342]
- change: changed login animation [DV-2150]
- change: redesigned the support page [DV-2270]

---
## [0.2.24] - 2025-06-06

- change: changed withdrawal rules [DV-2287]
- change: changed dashboard processing balance [DV-2292]
- fix: fixed domain in payer form [DV-2286]
- fix: fixed shaky cards bug with animation [DV-2295]

---
## [0.2.23] - 2025-06-05

- change: changed hot wallets on the dashboard [DV-2127]
- fix: fixed notifications [DV-2246]
- change: changed mail list wallets [DV-2155]
- change: changed the "connect Telegram" page [DV-2022]
- change: changed Tron settings [DV-2022]
- change: changed 2FA component [DV-2151]
- change: changed chart [DV-2074]
- feat: added new EVM coins [DV-2122]
- fix: fixed registration [DV-2134]
- fix: fixed processing balance [DV-2013]
- change: changed dashboard processing balance [DV-2115]
- feat: added hash search [DV-2107]
- update: added information popups, fixed styles and bugs [DV-2076]
- change: show secret and delete bad transfers only in debug mode [DV-2132]
- feat: added settings page descriptions [DV-2131]
- feat: added mail and system settings descriptions [DV-2133]
- feat: added "change exchange" modal [DV-2128]
- feat: added "delete exchange" modal, skeletons and buttons for exchanges list [DV-2126]
- feat: saving currencies with a save button [DV-2113]
- fix: fixed bugs [DV-1254]
- change: redesigned the exchange withdrawal rules page [DV-2129]
- fix: fixed bugs, changed email changing flow [DV-1254]
- fix: fixed change password modal position [DV-2215]
- fix: fixed step input bug [DV-2275]

---
## [0.2.22] - 2025-05-26

- change: changed withdrawal rules [DV-2085]
- change: changed create payment [DV-2069]
- refactor: ran prettier, redesigned password change [DV-1881]
- feat: added password check when changing the password [DV-2082]
- change: removed the `createNewSecrets` button [DV-2091]
- fix: fixed hot wallets grid checkbox mechanism [DV-1228]
- update: added new description for BCH [DV-2096]

---
## [0.2.21] - 2025-05-23

- change: changed dashboard processing balance [DV-2066]
- feat: added captcha [DV-2052]
- change: changed Tron on the dashboard [DV-1960]
- change: changed search [DV-2030]
- change: changed withdrawal rules [DV-2026]
- change: changed resources on the dashboard [DV-2013]
- change: changed create payment [DV-2011]
- change: changed multi-outputs [DV-2003]
- feat: added helper in withdrawal exchange [DV-1727]
- change: changed processing settings [DV-1880]
- fix: fixed wallets withdrawal rules [DV-1724]
- feat: added link in store [DV-1456]
- change: changed 2FA [DV-1721]
- change: changed chart [DV-1989]
- change: changed Tron processing settings [DV-1984]
- feat: added helper [DV-1983]
- fix: fixed dollar on the payment form [DV-1955]
- change: changed withdrawal rules [DV-1959]
- update: updated exchange selection [DV-1879]
- fix: fixed overflow navigation plate [DV-1933]
- fix: fixed error text on the login page [DV-1990]
- change: removed element library [DV-2017]
- change: changed exchanges select view [DV-2032]
- feat: added confirmation for updates [DV-2021]
- feat: added autofocus on input after opening the search page [DV-2016]
- change: changed 2FA modal styles [DV-2034]
- update: added loaders and migrated styles [DV-2061]
- fix: fixed webhooks table bug [DV-2060]
- feat: added skeleton for the withdrawal table [DV-2075]
- change: removed favorite languages if all languages fit in the select [DV-2065]

---
## [0.2.20] - 2025-05-13

- fix: fixed energy and bandwidth tooltip trigger width [DV-1961]
- feat: added Spanish and German languages [DV-1961]
- fix: fixed history tabs styles [DV-1972]
- feat: added a switch with full address information in transfer history search [DV-1971]

---
## [0.2.19] - 2025-05-12

- fix: fixed Telegram connection [DV-1930]
- change: changed dashboard processing balance [DV-1902]
- change: changed Tron processing settings page [DV-1921]
- fix: fixed filter in history [DV-1924]
- feat: added a checkbox on the transactions page [DV-1909]

---
## [0.2.18] - 2025-04-28

- change: changed main loader [DV-1904]
- change: changed dashboard deposit [DV-1771]
- feat: added Polygon icons [DV-1895]
- feat: added archive functionality in projects [DV-1770]
- feat: added transaction chart [DV-1873]
- feat: added KuCoin icon [DV-1876]
- feat: added payment creation to the store [DV-1782]
- feat: added a switch in exchange [DV-1672]
- feat: added a "download report" button [DV-1829]
- feat: added skeletons for dashboard balance cards [DV-1867]
- change: hid helpers before the dashboard is loaded [DV-1855]
- change: highlighted active exchange in history [DV-1786]
- update: added a timeout for front-end updates after backend and processing updates [DV-1863]
- feat: added a loader for slow internet connections [DV-1646]

---
## [0.2.17] - 2025-04-22

- fix: fixed notification [DV-1657]

---
## [0.2.16] - 2025-04-22

- feat: common notification component [DV-1843]
- feat: difference between `from_address` and `from_processing` [DV-1656]
- feat: exchange switch [DV-1672]
- update: new tooltip design [DV-1657]

---
## [0.2.15] - 2025-04-21

- fix: fixed transfers [DV-1656]
- fix: fixed withdrawal [DV-1856]
- feat: added BCH converter [DV-1822]
- fix: fixed on/off exchange button [DV-1835]
- feat: added Gate.io exchange [DV-1653]
- feat: added MEXC exchange [DV-1652]
- feat: added clickable area on the processing select card [DV-1796]
- change: removed dashboard wallets info when an exchange is not added [DV-1676]
- fix: fixed UTC date bug [DV-1816]
- change: changed form text [DV-1731]
- feat: added a switcher for exchange rules [DV-1659]
- feat: added support page [DV-1832]
- change: open withdrawal by default on the history page [DV-1837]
- change: open exchange tabs in history without a pre-selected exchange, changed URLs [DV-1833]
- change: changed URL for cold wallets [DV-1841]

---
## [0.2.14] - 2025-04-17

- update: added titles for helpers, styled project buttons [DV-1679]
- update: added a loader for updating, fixed BNB icons in transfers queue [DV-1762]
- change: redirected from installer to quick-start [DV-1766]
- update: updated tooltip for hot wallets balances block [DV-1673]
- update: updated descriptions on settings pages [DV-1790]
- feat: added autologin to `demo.dv.net` [DV-1791]
- feat: added KuCoin exchange [DV-1792]

---
## [0.2.13] - 2025-04-16

- change: changed updater URL [DV-1739]

---
## [0.2.12] - 2025-04-15

- feat: added BNB icons [DV-1743]
- feat: added 2FA for settings [DV-1691]

---
## [0.2.11] - 2025-04-14

- fix: hot-fix redirect [DV-1740]

---
## [0.2.10] - 2025-04-14

- feat: added helpers [DV-1683]

---
## [0.2.9] - 2025-04-14

- fix: changed output error for exchange [DV-1640]
- feat: added timezones [DV-1613]
- change: changed Telegram [DV-1520]
- change: changed history page [DV-1515]
- feat: added updater [DV-1557]
- feat: added confirmation for generating a new API key for a project [DV-1648]
- feat: added a quick-start page [DV-1663]
- change: adjusted web installer [DV-1486]
- feat: added a page with Tron settings [DV-1143]
- fix: fixed merchant text [DV-1718]
- fix: fixed updating [DV-1674]
- change: hid the registration button when not needed [DV-1712]
- feat: added a link for the updating page from the info modal [DV-1719]

---
## [0.2.1] - 2025-03-25

- change: changed search [DV-1545]
- feat: added tooltips for exchange history [DV-1509]
- change: changed tooltip text [DV-1476]
- feat: added a "generate new secret key" button [DV-1533]
- change: changed notifications [DV-1482]
- update: image optimization [DV-1439]
- update: edited demo [DV-1469]
- change: changed UI kit and CI/CD [DV-1464]
- change: changed installer [DV-1441]
- change: changed dollar function [DV-1413]
- change: changed exchange connection [DV-1414]
- feat: added a link to the documentation [DV-1355]
- change: changed the "change password" view [DV-1347]
- change: changed API key in the store [DV-1365]
- change: changed transfers [DV-1353]
- change: changed webhooks history [DV-1349]
- change: changed exchange text [DV-1306]
- change: changed balance cards [DV-1292]
- change: changed withdrawal rules [DV-1297]
- feat: added a tab for transfer history [DV-889]
- change: changed installer [DV-1239]
- change: changed tooltip [DV-1241]
- update: updated wallet display logic [DV-1307]
- feat: made currencies in the hot wallet list clickable [DV-1271]
- change: redesigned the deposit table, changed resources, and styled dashboard titles [DV-1284]
- update: updated transaction history [DV-1291]
- feat: added balance auto-update every 30 seconds [DV-1329]
- change: removed all element skeletons and modals [DV-1358]
- update: updated webhooks history [DV-1410]
- fix: fixed wallet pairs search [DV-1438]
- feat: added sorting for wallets on the dashboard [DV-1468]
- update: updated favicons and manifest [DV-1399]

---
## [0.2.0] - 2025-02-25

- change: changed reset password page [DV-1166]
- change: changed projects [DV-792]
- feat: added a "delete transfer" button [DV-1154]
- change: changed hot balance [DV-1062]
- change: changed transfer buttons [DV-1093]
- change: changed hot wallets [DV-1005]
- change: changed withdrawal rules [DV-1024]
- change: changed exchange connection pages [DV-870]
- change: changed settings [DV-793]
- change: changed profile [DV-768]
- change: changed transaction search [DV-808]
- change: changed wallet search [DV-807]
- feat: added the ability to receive wallets without an API [DV-787]
- change: changed processing balances [DV-848]
- change: changed auto-exchange [DV-724]
- change: changed dashboard [DV-753]
- change: separated the payment form from the admin panel [DV-708]
- feat: added private key downloads [DV-746]
- feat: added wallet logs [DV-778]
- change: hid the "delete transfer" button on production [DV-1429]

---
## [0.1.3] - 2025-01-17

- change: changed withdrawal rules page [DV-727]
- update: moved the development server [DV-560]
- change: changed connected exchanges [DV-671]
- feat: added "send hot wallets" functionality [DV-508]
- feat: added filters for hot wallets [DV-445]
- feat: added commission [DV-429]
- change: changed withdrawal rules [DV-427]
- change: changed hash payment form [DV-420]

---
## [0.1.2] - 2024-12-03

- change: changed hot wallets page [DV-405]
- change: changed withdrawal rules page [DV-401]
- feat: added order history page [DV-351]
- change: changed wallet search [DV-377]
- feat: added order history in exchange [DV-351]
- feat: displayed deposit wallets [DV-352]
- feat: created a general component for status [DV-333]
- change: changed addresses [DV-327]
- feat: added address search [DV-206]
- feat: added exchange wallets to withdrawal rules [DV-270]
- feat: added root user email confirmation in the installer [DV-308]
- change: changed date format in profile [DV-289]
- feat: added exchange withdrawal [DV-285]
- feat: added email confirmation page [DV-274]
- change: changed API monitors [DV-275]
- change: changed dashboard [DV-251]
- feat: added password reset [DV-236]
- change: moved from API v3 to API v1 [DV-186]
- fix: fixed bugs [DV-217]
- feat: added address search [DV-206]
- feat: added "send hot wallets" button [DV-191]
- feat: added translations for words [DV-190]
- feat: added getting addresses from the exchange [DV-185]
- fix: fixed current exchange [DV-165]
- update: updated wallets [DV-161]
- fix: fixed addresses [DV-160]
- feat: added JSON formatting [DV-2742]
- feat: added request body [DV-2741]

---
## [0.1.1] - 2024-11-07

- feat: implemented auto-exchange API [DV-2724]
- change: grouped root settings [DV-2722]
- feat: output information about the client [DV-2637]
- feat: created a page with auto-exchange settings [DV-2715]
- feat: new API dictionaries [DV-2717]
- update: improved the translations page for active states [DV-2708]
- update: improved the transfers page [DV-2673]
- feat: created email templates [DV-2653]
- refactor: reworked the logic for user & root settings [DV-2660]
- feat: displayed gas in ETH [DV-2586]
- feat: implemented API monitors [DV-2631]
- feat: added the ability to remove the current exchange [DV-2622]
- change: changed withdrawal [DV-2560]
- feat: added input in root settings [DV-2589]
- change: changed webhooks in the store [DV-2531]
- feat: added monitors page [DV-2580]
- fix: fixed pooling [DV-2585]
- update: amendments from the meeting [DV-2549]
- feat: implemented the choice of the current exchange [DV-2437]
- feat: added output of the list of connected exchanges [DV-2529]
- update: improved the transaction search section [DV-2520]
- feat: withdrawal of processing wallets [DV-2427]
- feat: added the ability to open transactions and wallets in explorers [DV-2519]
- feat: added rules for changing password [DV-2493]
- feat: added status and error text to transfers [DV-2489]
- feat: added infinite scroll in webhooks history [DV-2487]
- feat: created a general component for demo webhook history [DV-2484]
- fix: bug fixes [DV-2470]
- update: mobile layout for PF [DV-2469]
- feat: created webhooks history page [DV-2447]
- change: changed design of the withdrawal page [DV-2444]

---
## [0.1.0] - 2024-10-15

- change: changed exchange rates [DV-2425]
- feat: connected withdrawal of cold and hot wallets [DV-2424]
- feat: added filter and pagination [DV-2426]
- feat: added output of receipt data [DV-2419]
- change: changed behavior for withdrawal addresses [DV-2357]
- refactor: code refactoring [DV-2389]
- feat: added 2FA check in withdrawal [DV-2387]
- change: changed payer form [DV-2391]

---
## [0.0.9] - 2024-10-09

- feat: added user settings [DV-2352]
- feat: added root settings [DV-2351]
- change: changed payer form [DV-2371]

---
## [0.0.8] - 2024-10-08

- feat: added transaction output in the payer form [DV-2353]
- feat: added transaction polling [DV-2337]
- feat: added enable/disable registration (root) [DV-2335]
- update: translated the application [DV-2312]

---
## [0.0.7] - 2024-10-03

- fix: fixed dashboard [DV-2334]
- feat: added `merchant_domain` and `merchant_pay_form_domain` fields in the installer [DV-2331]
- change: deleted all tooltips in the project (except for error types) [DV-2325]
- feat: added exchange connections page [DV-2285]
- fix: corrected text in the app [DV-2288]
- change: changed whitelist [DV-2296]
- feat: added transaction search page [DV-2279]
- fix: fixed the display of currencies in the store settings [DV-2281]
- change: changed "send addresses" [DV-2272]

---
## [0.0.6] - 2024-09-30

- change: changed installer [DV-2246]
- change: changed hot wallets pagination [DV-2240]
- update: synchronized textarea with line input tab [DV-2238]
- feat: added a history page for hot wallet withdrawals [DV-2234]
- update: updated UI kit to version 3.0 [DV-2224]
- update: improved the display of balances for processing wallets [DV-2228]
- feat: implemented a deposit summary section [DV-2221]
- refactor: broke down into components [DV-2223]
- feat: added users page [DV-2209]
- fix: fixed TS error [DV-2215]
- feat: added translations page [DV-2196]
- feat: connected backends to the output rule section [DV-2140]
- feat: added a transaction block on the dashboard [DV-2118]
- fix: corrected version display [DV-2178]

---
## [0.0.5] - 2024-09-16

- update: added build and push to GitLab package registry [DV-2163]

---
## [0.0.4] - 2024-09-02

- change: changed hot wallets page [DV-2109]
- change: changed hot wallet withdrawal rules page [DV-2100]
- feat: added `transaction_count` and `minimal_payment` to the store [DV-2099]
- feat: added transfers page [DV-2085]
- change: changed payer form [DV-2096]
- feat: added a "copy secret" button in webhook [DV-2081]
- update: finalized the payment form [DV-2055]
- feat: added currencies component [DV-2019]

---
## [0.0.3] - 2024-08-22

- fix: corrected error text [DV-1995]
- update: changed UI kit to version 2.0 [DV-2036]
- change: changed installer [DV-1993]
- update: translated project and profile pages [DV-2004]

---
## [0.0.2] - 2024-08-13

- change: checked user 2FA before saving seed phrase [DV-1992]
- feat: added dashboard [DV-1972]
- update: updated projects page [DV-1979]
- update: updated 2FA [DV-1977]
- update: updated UI kit [DV-1956]
- fix: fixed timezone [DV-1946]
- feat: added a payment form [DV-1885]
- feat: added rules for withdrawal from hot wallets [DV-1934]
- feat: added hot wallets [DV-1924]
- fix: fixed TypeScript errors [DV-1925]
- feat: implemented installer steps [DV-1830]
- change: changed sidebar [DV-1901]
- feat: developed profile page [DV-1895]
- update: edited "Your projects" page [DV-1896]
- update: added development CI/CD [DV-1899]
- feat: implemented the exchange rates section [DV-1821]
- feat: added notification component [DV-1851]
- feat: added two-step authentication [DV-1803]
- feat: added localization to the project [DV-1789]
- update: improved authorization on the new frontend [DV-1808]
- feat: added store pages [DV-1778]

---
## [0.0.1] - 2024-07-01

- feat: initial commit
