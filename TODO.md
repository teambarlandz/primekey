# TODO — Frontend-Backend Integration

## HIGH PRIORITY (Core Features Broken Without Backend)

- [x] Create backend model for saved/favorited properties (User + Property FK, unique together)
- [x] Create backend API: POST /api/v1/users/favorites/toggle/ (toggle favorite)
- [x] Create backend API: DELETE /api/v1/users/favorites/<property_id>/ (unsave a property)
- [x] Create backend API: GET /api/v1/users/favorites/ (list saved properties)
- [x] Add frontend API client functions: saveFavorite(), removeFavorite(), fetchFavorites()
- [x] Wire AuthInterceptSheet "Save Property" action to call toggleFavorite() instead of toggling local state only
- [x] Wire property detail page "Save" button to call toggleFavorite() with JWT auth
- [x] Wire search page heart icon to call toggleFavorite() with JWT auth

## MEDIUM PRIORITY (Auth & Session)

- [ ] Landlord login: Add OTP login flow for landlords (reuse existing /auth/otp/verify with purpose="login")
- [ ] Landlord dashboard: Fetch landlord profile using JWT from login instead of just localStorage UUID
- [ ] Wire "Remember this device" to store refresh token in localStorage and use it on page reload
- [ ] Add user profile endpoint: GET /api/v1/users/me/ (return current user from JWT)
- [ ] Wire property inquiry form to submit with JWT auth header (currently AllowAny, but should attach user if logged in)
- [ ] Wire inspection booking to attach JWT when user is logged in

## LOW PRIORITY (Nice-to-Have)

- [ ] Add "My Saved Properties" page at /account/saved that lists favorited properties
- [x] Show saved status (filled heart) on property cards when user has favorited them
- [ ] Add favorites count to user profile/dashboard
- [ ] Sync favorites across devices when "Remember this device" is used
