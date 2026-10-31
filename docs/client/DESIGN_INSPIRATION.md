# Design inspiration (Mobbin)

Patterns to emulate for Mystic Hair Co. — adapted to sage/cream/gold brand, not copied layouts.

## Booking & services

| Reference                                                                                          | Takeaway                                                                      |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Fresha — Select services (iOS)](https://mobbin.com/screens/0d7d9610-631e-4924-baf2-86d572da9c8a)  | Service cards with duration, price, `+` add — Luke is solo so no staff picker |
| [Future Pro — Date/time (iOS)](https://mobbin.com/screens/dbb6f801-b38c-44e7-b3c1-df85411cdd1b)    | Horizontal date strip + time grid; minimal black/sage primary                 |
| [Calendly — Date & time (web)](https://mobbin.com/screens/254dc09b-8dd5-4057-a1e6-261900b61f18)    | Split panel: details left, calendar + slots right                             |
| [HoneyBook — Schedule call (web)](https://mobbin.com/screens/cc31fcb0-8e1e-45a8-8369-f05afdb2ab09) | Intake + calendar in one calm form                                            |
| [Apollo — Book meeting (web)](https://mobbin.com/screens/f287b94c-0d99-4cfb-8f60-6468c8f20ea5)     | Three-column book flow                                                        |

## Checkout & admin

| Reference                                                                                           | Takeaway                                       |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [Skillshare — Payment modal (web)](https://mobbin.com/screens/1e07d3f3-741b-4390-ac20-1aec909cbdbb) | Service summary + Stripe-style payment column  |
| [Later — Calendar dashboard (web)](https://mobbin.com/screens/11bb98ce-9bb1-48c6-bb8f-b555ef670350) | Luke studio: week calendar, block time, promos |

## Platform notes

- **iOS:** Large titles, bottom primary CTA, grouped lists (`InsetGrouped` feel), SF Pro spacing.
- **Android:** Material 3 — tonal surfaces, `FilledTonalButton` for secondary, 12dp corner radii on cards.
- **Web:** Mid-century calm — serif display (Fraunces), generous whitespace, one obvious “Book” path.
