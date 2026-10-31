# UI inspiration (Mobbin)

References used for Mystic Hair Co. luxury polish (Oct 2026).

## Shared app chrome

| Pattern                             | Applied in                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| Sticky header + grain shell         | `(client)/layout` → `MysticAppShell`, `/book`, visits, messages, plans, shop, success |
| Auth frosted card on shell gradient | `(auth)/layout`, `MysticAuthCard`                                                     |
| Studio nav pills + ops cards        | `studio/layout`, `StudioNav`, `StudioOpsPanel`                                        |

Design tokens live in `apps/web/src/components/mystic/mystic-styles.ts`.

## Web marketing & booking

| Pattern                        | Source                                                                                               | Applied in                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Full-bleed hero + overlap card | Fresha venue header                                                                                  | `MysticHero` bleed photo + floating card  |
| Editorial hero + stat strip    | [Hers web hero](https://mobbin.com/screens/04ae05ba-3a5a-4696-9da9-40182e39186e)                     | `MysticHero` stats row                    |
| Frosted sticky header          | [Selfridges](https://mobbin.com/screens/10dfc2c3-9c46-4d13-85f2-1431ff5c0417)                        | `MysticHeader`                            |
| Service cards + featured tier  | [Fresha business profile](https://mobbin.com/screens/0a3b5b60-24a4-4e67-a82b-ff26385dfebd)           | `MysticServices`, `MysticPlans` (Luxe)    |
| Membership pricing layout      | [Superpower pricing section](https://mobbin.com/sites/sections/09904386-61ba-4210-a9f6-a025335da025) | `MysticPlans`                             |
| Progress + time chips          | [Fresha date/time](https://mobbin.com/screens/2604af3d-e9d1-4fab-b863-5fd576604a66)                  | `BookFlowClient`                          |
| Review summary before pay      | [Fresha review continue](https://mobbin.com/screens/c104c201-de96-4eb5-9432-89a8241e2311)            | `MysticSummaryRowGroup` on book review    |
| Sticky pay bar + blur          | Zocdoc / Alan review flows                                                                           | Book review sticky CTA + secure line      |
| Secure booking footer          | [Zocdoc review](https://mobbin.com/screens/3911c82e-a8fc-4ad2-99f3-f18cfb3104a2)                     | `MysticSecureBookingLine` on book review  |
| Post-book calendar + upsell    | [Zocdoc confirmation](https://mobbin.com/flows/fcd6461e-af19-4ca9-9864-8b21c286888c)                 | `/book/success` + summary rows            |
| Up next visit hero             | [Zocdoc upcoming](https://mobbin.com/flows/fcd6461e-af19-4ca9-9864-8b21c286888c)                     | `MysticVisitUpNext` / `NativeVisitUpNext` |
| Provider profile sheet         | [Alan therapist detail](https://mobbin.com/flows/ee668eed-0f44-4587-98c5-3d274a213ad0)               | `LukeProfileSheet`                        |
| Appointment summary rows       | [Alan appointment](https://mobbin.com/screens/6ab8b275-a280-48a4-bc27-5359722b07da)                  | `MysticTrustStrip`, `MysticExperience`    |

## Mobile

| Pattern                 | Source                                                                            | Applied in                          |
| ----------------------- | --------------------------------------------------------------------------------- | ----------------------------------- |
| Booking summary sheet   | [Careem Salon&Spa](https://mobbin.com/flows/24c29222-3b7d-4dc8-983d-50dcd606e341) | Mobile book cards + gold summary    |
| Sticky total + CTA      | Fresha / Alan flows                                                               | `NativeButton` + summary block      |
| Sticky message composer | iMessage / Alan chat                                                              | Messages tab `KeyboardAvoidingView` |

## Feature ideas (backlog)

- Swap Pixabay picks for Luke’s own photography when ready (`pnpm fetch:marketing-images` with `PIXABAY_API_KEY`)
- Service cards use custom sage/gold SVG illustrations in `MysticServiceIllustration`
- Mirror post-book calendar + package upsell on mobile checkout return
- Visit detail sheet with Manage / Add to calendar / inspo (Angi [project details](https://mobbin.com/screens/ec6ef6b6-9a4e-4fc3-a67b-3f74a1b72325))
- Studio home map + horizontal “next visit” carousel (Jobber [home](https://mobbin.com/screens/bc7ab501-113a-46c8-8489-92e99140ea45))
- Booking scheduled hero + provider call/message chips (Urban Company [confirmation](https://mobbin.com/screens/37aa2c26-ca69-4621-9c09-583fc84d6834))
- Confirmation ref as large monospace hero (CVS [visit details](https://mobbin.com/screens/e8175343-7c77-4832-8564-62a3d495dc8c))
- Map-backed confirmation card with edit arrival (Lugg [booking](https://mobbin.com/screens/7fe82c99-0098-4736-8234-07145f472d5a))
