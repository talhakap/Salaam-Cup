# Salaam Cup - Full Test Task Sheet

---

## SECTION 1: PUBLIC PAGES

### 1.1 Home Page (`/`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.1.1 | Page loads | Navigate to `/` | Hero section, tournaments, news, FAQ, sponsors, CTA all render | |
| 1.1.2 | Tournament cards display | Scroll to tournaments section | All featured tournaments show with name, image, dates, sport | |
| 1.1.3 | Tournament card links | Click a tournament card | Navigates to `/tournaments/:slug` | |
| 1.1.4 | News section renders | Scroll to "Where Stories Become Legacy" | News cards in 3-column grid with headline, image, date | |
| 1.1.5 | News pagination dots | If more than 3 news items, click pagination dots | News cards change to next set | |
| 1.1.6 | Featured FAQs | Scroll to FAQ accordion section | Up to 5 featured FAQs render as expandable accordion items | |
| 1.1.7 | FAQ accordion interaction | Click a FAQ question | Answer expands/collapses | |
| 1.1.8 | Sponsor bar | Scroll to sponsor marquee | Sponsors animate in a scrolling marquee with logos | |
| 1.1.9 | Ready to Compete CTA | Scroll to CTA section | CTA renders with action button | |
| 1.1.10 | Mobile responsiveness | View on 400px wide viewport | All sections stack vertically, no horizontal overflow | |

### 1.2 Tournaments Listing (`/tournaments`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.2.1 | Page loads | Navigate to `/tournaments` | All tournaments listed with cards | |
| 1.2.2 | Tournament card info | Inspect any card | Shows name, dates, sport, venue, status, registration status | |
| 1.2.3 | Click tournament | Click a tournament card | Navigates to tournament detail page | |
| 1.2.4 | Mobile layout | View on mobile | Cards stack in single column | |

### 1.3 Tournament Detail (`/tournaments/:id`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.3.1 | Page loads | Navigate to `/tournaments/senior-mens-hockey` | Hero image, tournament name, sub-nav bar renders | |
| 1.3.2 | Sub-navigation bar | Check TournamentNav | Shows tabs: Home, Schedule, Standings, Playoffs, Rules, Awards | |
| 1.3.3 | Division tabs | Click different division tabs | Content updates to show division-specific teams/matches | |
| 1.3.4 | Teams tab | Click Teams tab | Lists all approved teams for the division | |
| 1.3.5 | Team link | Click a team name | Navigates to `/teams/:id` team detail page | |
| 1.3.6 | Schedule preview | Scroll to schedule section | Shows upcoming matches with date, time, teams, venue | |
| 1.3.7 | Standings preview | Scroll to standings | Shows standings table with correct columns for sport type | |
| 1.3.8 | Playoff bracket preview | Scroll to bracket section | If bracket generated & visible, shows bracket with "Full Bracket" link | |
| 1.3.9 | Bracket mobile | View bracket on mobile viewport | Rounds stack vertically instead of side-by-side | |
| 1.3.10 | Champion banner | If final winner set | Champion banner shows with team logo/name | |
| 1.3.11 | Info banner | If showInfoBanner = true | Info banner section renders | |
| 1.3.12 | Sponsor banner | If showSponsorBanner = true | SponsorBar renders on page | |

### 1.4 Tournament Schedule (`/tournaments/:id/schedule`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.4.1 | Page loads | Navigate to schedule page | Matches listed with dates, times, teams, scores | |
| 1.4.2 | Division filter | Select a division filter | Only matches from that division shown | |
| 1.4.3 | Date filter | Select a specific date | Only matches on that date shown | |
| 1.4.4 | Status filter | Filter by scheduled/live/final | Correctly filters match list | |
| 1.4.5 | Venue & field info | Check match with venue set | Venue name and field location displayed | |
| 1.4.6 | Mobile layout | View on mobile | Matches readable without horizontal scroll | |

### 1.5 Tournament Standings (`/tournaments/:id/standings`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.5.1 | Page loads | Navigate to standings page | Standings table renders | |
| 1.5.2 | Division tabs | Click different divisions | Table updates to show that division's standings | |
| 1.5.3 | Hockey standings columns | View hockey tournament | Shows W, L, T, PTS, GF, GA, GD columns | |
| 1.5.4 | Soccer standings columns | View soccer tournament | Shows W, D, L, PTS, GF, GA, GD columns | |
| 1.5.5 | Basketball standings columns | View basketball tournament | Shows W, L, PCT columns | |
| 1.5.6 | Softball standings columns | View softball tournament | Shows W, L, PCT columns | |
| 1.5.7 | Team ordering | Check table order | Teams sorted by position (custom order if reordered) | |
| 1.5.8 | Mobile layout | View on mobile | Table scrollable or reformatted | |

### 1.6 Tournament Playoffs (`/tournaments/:id/playoffs`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.6.1 | Page loads | Navigate to playoffs page | "Road To The Championship" heading, division tabs | |
| 1.6.2 | Division tabs | Click division tabs | Bracket updates per division | |
| 1.6.3 | Bracket not available | Division without bracket | Shows "Playoff bracket is not yet available" message | |
| 1.6.4 | Bracket visible | Division with showBracket=true & generated | Bracket renders with rounds and matchups | |
| 1.6.5 | Round names | Check round labels | Correct names: Wild Card, Round of 16, Quarterfinals, Semifinals, Final | |
| 1.6.6 | Seed numbers | Check matchup cards | Seed numbers shown (e.g., #1, #8) | |
| 1.6.7 | Bye display | Check bye matches | Bye matches show team name + "BYE" label, dimmed | |
| 1.6.8 | Score display | Finalized matches | Scores shown for home and away teams | |
| 1.6.9 | Winner highlighting | Finalized match | Winner row has bold text and highlighted background | |
| 1.6.10 | Champion banner | Final match completed | Champion banner with trophy icon, team logo, name | |
| 1.6.11 | Venue/time info | Match with venue/time set | Date/time and venue/field shown on matchup card | |
| 1.6.12 | Desktop layout | View on 1280px+ | Rounds displayed side-by-side horizontally | |
| 1.6.13 | Mobile layout | View on 400px | Rounds stacked vertically with round headers | |

### 1.7 Tournament Rules (`/tournaments/:id/rules`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.7.1 | Page loads | Navigate to rules page | Division tabs and rules content render | |
| 1.7.2 | Division tabs | Switch divisions | Rules content changes per division | |
| 1.7.3 | Rich text rendering | Division with rules content | HTML/rich text renders correctly (headings, lists, bold, etc.) | |
| 1.7.4 | Empty rules | Division without rules | Appropriate empty state message | |

### 1.8 Tournament Awards (`/tournaments/:id/awards`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.8.1 | Page loads | Navigate to awards page | Awards displayed by year/division/category | |
| 1.8.2 | Award categories | Check displayed awards | Shows Champions, Runner Up, MVP, etc. | |
| 1.8.3 | Team logos | Award with logo | Logo image renders | |
| 1.8.4 | Empty state | Tournament with no awards | Appropriate message shown | |

### 1.9 Team Detail (`/teams/:id`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.9.1 | Page loads | Navigate to team detail page | Team name, tournament, division, status shown | |
| 1.9.2 | Roster tab | Click Roster tab | Shows roster players; indicates which have self-registered | |
| 1.9.3 | Roster visibility | Tournament with rostersVisible=false | Roster tab hidden | |
| 1.9.4 | Registrations tab | Click Registrations tab | Shows self-registered players with confirmed/flagged status | |
| 1.9.5 | Team logo | Team with logo URL | Logo renders | |

### 1.10 Registration (`/register`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.10.1 | Page loads | Navigate to `/register` | Registration form renders | |
| 1.10.2 | Team registration | Fill in team name, captain info, select tournament | Form submits, team created with "pending" status | |
| 1.10.3 | Player self-registration | Fill in player info with team selected | Player registered; if matching roster entry, status = "confirmed" | |
| 1.10.4 | Free agent registration | Register without selecting a team | Player registered as free agent, status = "flagged" | |
| 1.10.5 | Validation errors | Submit form with missing required fields | Validation errors shown | |
| 1.10.6 | Duplicate team warning | If allowMultipleRegistrations=false, register same captain email twice | Warning or prevention of duplicate | |
| 1.10.7 | Mobile form | View form on mobile | Form fields stack vertically, usable | |

### 1.11 About Page (`/about`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.11.1 | Page loads | Navigate to `/about` | Hero, sponsor bar, letter, history, values, events render | |
| 1.11.2 | Letter section | Scroll to letter | Either PDF embed or rich text renders based on admin config | |
| 1.11.3 | Moments gallery | Scroll to gallery | Images displayed | |
| 1.11.4 | History section | Scroll to "Our Beginnings" / "How We Grew" | History content renders | |
| 1.11.5 | Value cards | Scroll to values | Cards displayed | |
| 1.11.6 | Special Awards section | If special awards exist | "We Admire Them" section shows in dark background, 2-column grid | |
| 1.11.7 | Special Awards hidden | If no special awards | Section not rendered | |
| 1.11.8 | Celebrations gallery | Scroll to celebrations | Images displayed | |
| 1.11.9 | Upcoming events | Scroll to events carousel | Events shown | |

### 1.12 Media Gallery (`/media`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.12.1 | Page loads | Navigate to `/media` | Year-based accordion sections render | |
| 1.12.2 | Year accordion | Click a year | Expands to show tournament cards | |
| 1.12.3 | Tournament cards | Inspect card | Shows image, category, name, "Show All" link | |
| 1.12.4 | Show All link | Click "Show All" | Opens link URL | |

### 1.13 FAQ Page (`/faq`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.13.1 | Page loads | Navigate to `/faq` | All FAQs displayed in accordion | |
| 1.13.2 | Expand/collapse | Click question | Answer toggles visibility | |
| 1.13.3 | All FAQs shown | Compare to admin | All FAQs (not just featured) shown | |

---

## SECTION 2: AUTHENTICATION

### 2.1 Admin Authentication
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.1.1 | Admin login page | Navigate to `/admin-login` | Login form with email/password fields | |
| 2.1.2 | Successful login | Enter valid admin credentials | Redirects to `/admin` dashboard | |
| 2.1.3 | Invalid credentials | Enter wrong password | Error message displayed | |
| 2.1.4 | Admin logout | Click logout from admin | Session cleared, redirected to login | |
| 2.1.5 | Protected routes | Navigate to `/admin` without login | Redirected to `/admin-login` | |
| 2.1.6 | API protection | Call admin API without auth | Returns 401 | |

### 2.2 Captain Authentication
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.2.1 | Captain login page | Navigate to `/captain-login` | Login form renders | |
| 2.2.2 | Successful login | Enter valid captain credentials | Redirects to `/captain` dashboard | |
| 2.2.3 | Invalid credentials | Enter wrong password | Error message | |
| 2.2.4 | Captain logout | Click logout | Session cleared | |
| 2.2.5 | Auto-linking | Captain logs in with email matching approved team | Teams auto-assigned to captain | |

### 2.3 Password Reset
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.3.1 | Forgot password page | Navigate to `/reset-password` | Reset form renders | |
| 2.3.2 | Request reset | Enter email and submit | Reset email sent (via Supabase) | |

---

## SECTION 3: CAPTAIN DASHBOARD

### 3.1 Captain Dashboard (`/captain`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3.1.1 | Dashboard loads | Login as captain, navigate to `/captain` | Dashboard renders with linked teams | |
| 3.1.2 | My teams listed | Check teams section | Shows all teams linked to captain's email | |
| 3.1.3 | Roster submission | Submit roster for a team | Players added to team roster | |
| 3.1.4 | Roster auto-matching | Submit roster with player who already self-registered | Both roster entry and registration set to "confirmed" | |

---

## SECTION 4: ADMIN DASHBOARD & MANAGEMENT

### 4.1 Admin Dashboard (`/admin`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.1.1 | Dashboard loads | Navigate to `/admin` | Dashboard with stats (pending teams, approved teams, etc.) | |
| 4.1.2 | Pending teams count | Check stat | Shows real count of pending team registrations | |
| 4.1.3 | Quick approve | Use quick approve action on dashboard | Team status changes to "approved" | |
| 4.1.4 | Navigation links | Click sidebar nav items | All admin pages accessible | |

### 4.2 Admin Tournaments (`/admin/tournaments`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.2.1 | List tournaments | Navigate to page | All tournaments listed | |
| 4.2.2 | Create tournament | Fill form and submit | New tournament created with name, dates, sport, venue | |
| 4.2.3 | Edit tournament | Click edit on existing | Form pre-filled, save updates | |
| 4.2.4 | Delete tournament | Click delete | Tournament removed (with confirmation) | |
| 4.2.5 | Registration toggle | Toggle registration open/closed | `registrationOpen` flag updates | |
| 4.2.6 | Roster visibility toggle | Toggle roster visibility | `rostersVisible` flag updates | |
| 4.2.7 | Standings type selector | Change standings type | Saves hockey_standard/soccer_standard/etc. | |
| 4.2.8 | Division management | Add/edit/delete divisions within tournament | Divisions CRUD works | |
| 4.2.9 | Division venue | Set venue on a division | Venue saved and displayed | |
| 4.2.10 | Tournament reorder | Drag/reorder tournaments | Sort order persisted | |

### 4.3 Admin Teams (`/admin/teams`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.3.1 | List all teams | Navigate to page | All teams listed | |
| 4.3.2 | Status filter - All | Select "All" filter | Shows all teams | |
| 4.3.3 | Status filter - Pending | Select "Pending" | Only pending teams shown | |
| 4.3.4 | Status filter - Approved | Select "Approved" | Only approved teams shown | |
| 4.3.5 | Status filter - Rejected | Select "Rejected" | Only rejected teams shown | |
| 4.3.6 | Approve team | Click approve button | Team status = "approved", captain credentials created | |
| 4.3.7 | Approve returns credentials | After approve | Admin sees generated email/password for captain | |
| 4.3.8 | Reject team | Click reject button | Team status = "rejected", rejection email sent | |
| 4.3.9 | Admin create team | Use admin team create form | Team created directly with "approved" status | |

### 4.4 Admin Players (`/admin/players`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.4.1 | List players | Navigate to page | All self-registered players listed | |
| 4.4.2 | Filter confirmed | Select "Confirmed" filter | Only confirmed players shown | |
| 4.4.3 | Filter flagged | Select "Flagged" filter | Only flagged players shown | |
| 4.4.4 | Sort by date | Check ordering | Players sorted by registration date (newest first) | |
| 4.4.5 | Player details | Inspect a player row | Shows name, DOB, team, status, registration date | |

### 4.5 Admin Matches (`/admin/matches`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.5.1 | List matches | Navigate to page | All matches listed | |
| 4.5.2 | Create match | Fill form: tournament, division, home/away teams, date, venue | Match created | |
| 4.5.3 | Edit match | Edit score, status, venue, field | Match updated | |
| 4.5.4 | Delete match | Delete a match | Match removed | |
| 4.5.5 | Venue & field | Set venue and field location on match | Saved and displayed | |
| 4.5.6 | Import matches | Use match import feature | Bulk matches imported | |
| 4.5.7 | Pulled flags | Set pulledHomeTeam / pulledAwayTeam | Match excluded from that team's standings on recalc | |
| 4.5.8 | Score saves recalculate standings | Save final score | Standings auto-recalculate | |

### 4.6 Admin Playoffs (`/admin/playoffs`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.6.1 | Page loads | Navigate to page | Tournament and division selectors shown | |
| 4.6.2 | Select tournament/division | Choose from dropdowns | Settings form loads | |
| 4.6.3 | Set teams qualifying | Enter number of qualifying teams | Value saved | |
| 4.6.4 | Bracket size selection | Select bracket size (4/8/16/32/64) | Byes auto-calculated | |
| 4.6.5 | Bye count display | Set 6 qualifying, bracket 8 | Shows "Top 2 seeds get a first-round bye" | |
| 4.6.6 | Show bracket toggle | Toggle show bracket | Flag saved | |
| 4.6.7 | Save settings | Click Save Settings | Settings persisted | |
| 4.6.8 | Generate bracket | Click Generate Bracket | Bracket generated with correct seeding | |
| 4.6.9 | Seed ordering | Check generated bracket | 1v8, 4v5, 3v6, 2v7 (standard bracket seeding) | |
| 4.6.10 | Byes assigned correctly | If byes configured | Top seeds get first-round byes | |
| 4.6.11 | Enter scores | Enter home/away scores for a match | Scores saved | |
| 4.6.12 | Tied score - pick winner | Enter tied score | "Select winner (OT/SO)" buttons appear, picking one saves | |
| 4.6.13 | Winner auto-advance | Save final match with winner | Winner advances to next round | |
| 4.6.14 | Reset bracket | Click Reset Bracket | All playoff matches deleted, settings unlocked | |
| 4.6.15 | Placeholder linking | Generate bracket with imported placeholder matches | Bracket matches linked to imported matches by round name | |
| 4.6.16 | Linked match info | Match linked to imported placeholder | Venue/time/field from import shown on bracket | |
| 4.6.17 | Desktop layout | View on desktop | Rounds side-by-side | |
| 4.6.18 | Mobile layout | View on mobile | Rounds stacked vertically | |

### 4.7 Admin Standings / Reorder (`/admin/standings-adjustments`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.7.1 | Page loads | Navigate to page | Tournament/division selectors shown | |
| 4.7.2 | Select tournament/division | Choose options | Standings table loads with team positions | |
| 4.7.3 | Move team up | Click up arrow on a team | Team swaps position with team above | |
| 4.7.4 | Move team down | Click down arrow | Team swaps with team below | |
| 4.7.5 | Unsaved changes indicator | Move a team | "You have unsaved changes" message + Save/Reset buttons appear | |
| 4.7.6 | Save order | Click Save Order | Positions persisted to database | |
| 4.7.7 | Reset order | Click Reset | Reverts to last saved order | |
| 4.7.8 | Desktop layout | View on desktop | Full table with all stat columns | |
| 4.7.9 | Mobile layout | View on mobile | Card-based layout with position, arrows, team name, key stats | |

### 4.8 Admin Awards (`/admin/awards`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.8.1 | List awards | Navigate to page | Awards listed by tournament | |
| 4.8.2 | Create award | Fill form: tournament, division, year, category, team/player | Award created | |
| 4.8.3 | Edit award | Edit existing award | Changes saved | |
| 4.8.4 | Delete award | Delete an award | Award removed | |
| 4.8.5 | Categories | Check category options | Champions, Runner Up, MVP, etc. available | |

### 4.9 Admin News (`/admin/news`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.9.1 | List news | Navigate to page | All news items listed | |
| 4.9.2 | Create news | Fill headline, image URL, date, optional tournament | News item created | |
| 4.9.3 | Edit news | Edit existing item | Changes saved | |
| 4.9.4 | Delete news | Delete item | News removed | |
| 4.9.5 | Shows on home page | Create news item | Appears in home page news section | |

### 4.10 Admin Sponsors (`/admin/sponsors`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.10.1 | List sponsors | Navigate to page | All sponsors listed | |
| 4.10.2 | Create sponsor | Fill name, logo, website, sort order | Sponsor created | |
| 4.10.3 | Image upload | Upload sponsor logo | Image uploaded and displayed | |
| 4.10.4 | Edit sponsor | Edit details | Changes saved | |
| 4.10.5 | Delete sponsor | Delete sponsor | Sponsor removed | |
| 4.10.6 | Sort order | Reorder sponsors | Order persisted, marquee order changes | |

### 4.11 Admin FAQs (`/admin/faqs`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.11.1 | List FAQs | Navigate to page | All FAQs listed | |
| 4.11.2 | Create FAQ | Fill question and answer | FAQ created | |
| 4.11.3 | Featured toggle | Toggle "Featured" on a FAQ | FAQ appears on homepage (max 5) | |
| 4.11.4 | Max 5 featured | Try to feature a 6th FAQ | Backend rejects, error shown | |
| 4.11.5 | Sort order | Change sort order values | Order persisted | |
| 4.11.6 | Edit FAQ | Edit question/answer | Changes saved | |
| 4.11.7 | Delete FAQ | Delete FAQ | FAQ removed | |

### 4.12 Admin Venues (`/admin/venues`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.12.1 | List venues | Navigate to page | All venues listed | |
| 4.12.2 | Create venue | Fill name, address, map link | Venue created | |
| 4.12.3 | Edit venue | Edit details | Changes saved | |
| 4.12.4 | Delete venue | Delete venue | Venue removed | |
| 4.12.5 | Venue in forms | Check tournament/division/match forms | Venue selector available | |

### 4.13 Admin Sports (`/admin/sports`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.13.1 | List sports | Navigate to page | All sports listed | |
| 4.13.2 | Create sport | Fill name, icon, description | Sport created | |
| 4.13.3 | Edit sport | Edit details | Changes saved | |
| 4.13.4 | Delete sport | Delete sport | Sport removed | |

### 4.14 Admin Users (`/admin/users`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.14.1 | List users | Navigate to page | All admin/captain users listed | |
| 4.14.2 | Create user | Add new user with email and role | User created in Supabase Auth + users table | |
| 4.14.3 | Edit user role | Change user role admin/captain | Role updated | |
| 4.14.4 | Delete user | Delete a user | User removed | |

### 4.15 Admin About Content (`/admin/about-content`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.15.1 | Page loads | Navigate to page | Content editor loads | |
| 4.15.2 | PDF mode | Toggle to PDF upload | PDF upload form shown | |
| 4.15.3 | Rich text mode | Toggle to rich text | Quill editor shown | |
| 4.15.4 | Save content | Edit and save | Content persisted, shown on About page | |

### 4.16 Admin Waiver Content (`/admin/waiver`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.16.1 | Page loads | Navigate to page | Waiver content editor loads | |
| 4.16.2 | Save waiver | Edit and save content | Waiver content persisted | |

### 4.17 Admin Special Awards (`/admin/special-awards`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.17.1 | List special awards | Navigate to page | Special awards listed | |
| 4.17.2 | Create special award | Fill image, header, description | Award created | |
| 4.17.3 | Image upload | Upload award image | Image uploaded | |
| 4.17.4 | Edit special award | Edit details | Changes saved | |
| 4.17.5 | Delete special award | Delete | Award removed | |
| 4.17.6 | Shows on About page | Create award | Appears in "We Admire Them" section on About page | |

### 4.18 Admin Media Gallery (`/admin/media`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.18.1 | List media years | Navigate to page | Years listed | |
| 4.18.2 | Create year | Add new year | Year entry created | |
| 4.18.3 | Add tournament card | Fill image, category, name, show all link | Card added to year | |
| 4.18.4 | Image upload | Upload tournament image | Image uploaded | |
| 4.18.5 | Edit/delete | Edit or delete items | Changes saved/removed | |
| 4.18.6 | Shows on Media page | Create entries | Appears on public `/media` page | |

---

## SECTION 5: DATA INTEGRITY & LOGIC

### 5.1 Registration Auto-Matching
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.1.1 | Player matches roster | Player self-registers with same team + name + DOB as roster entry | Both player registration and roster entry = "confirmed" | |
| 5.1.2 | Player doesn't match | Player self-registers with different info | Player status = "flagged" | |
| 5.1.3 | Roster matches existing player | Captain submits roster with player who already self-registered | Both roster entry and previous player registration = "confirmed" | |
| 5.1.4 | Free agent flagged | Player registers without team | Status = "flagged" | |

### 5.2 Standings Calculation
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.2.1 | Hockey standings | Record match with W/L/T | Points calculated: W=2, T=1, L=0 | |
| 5.2.2 | Soccer standings | Record soccer match | Points: W=3, D=1, L=0 | |
| 5.2.3 | Basketball standings | Record basketball match | Win % calculated | |
| 5.2.4 | Softball standings | Record softball match | Win % calculated | |
| 5.2.5 | Pulled match - home | Set pulledHomeTeam=true | Home team's stats exclude this match, away team counts it | |
| 5.2.6 | Pulled match - away | Set pulledAwayTeam=true | Away team excluded, home team counts | |
| 5.2.7 | Standings adjustments | Add manual adjustment | Adjusted values applied on top of calculated standings | |
| 5.2.8 | Manual reorder | Reorder standings in admin | Custom positions persisted | |

### 5.3 Playoff Bracket Generation
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.3.1 | 8-team bracket, no byes | 8 teams qualify, bracket size 8 | 4 first-round matches, standard seeding | |
| 5.3.2 | 6-team bracket, 2 byes | 6 teams qualify, bracket size 8 | Top 2 seeds get byes, 2 first-round matches | |
| 5.3.3 | 24-team bracket, 8 byes | 24 teams, bracket 32 | Top 8 seeds get byes | |
| 5.3.4 | Winner advancement | Complete a match with winner | Winner populates next round match | |
| 5.3.5 | Final winner = champion | Complete final match | Champion banner appears | |
| 5.3.6 | Round name normalization | Imported matches with "Quarter Finals", "Semis", "Finals" | Correctly mapped to bracket rounds | |
| 5.3.7 | "Round Of 16" linking | Imported "Round Of 16" matches | Linked to correct bracket round | |
| 5.3.8 | "Wild Card" linking | Imported "Wild Card" matches | Linked to first bracket round | |

---

## SECTION 6: SEO & TECHNICAL

### 6.1 SEO
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 6.1.1 | Page titles | Check each public page | Unique, descriptive title with "Salaam Cup" | |
| 6.1.2 | Meta descriptions | Inspect head on each page | Relevant description with Toronto/GTA keywords | |
| 6.1.3 | Open Graph tags | Inspect OG tags | OG title, description, image present | |
| 6.1.4 | Sitemap | Navigate to `/sitemap.xml` | Valid XML sitemap with tournament and team URLs | |
| 6.1.5 | Robots.txt | Navigate to `/robots.txt` | Valid robots.txt with sitemap reference | |
| 6.1.6 | Canonical URLs | Check each page | Canonical tag set to correct URL | |
| 6.1.7 | JSON-LD schema | Check index.html | SportsOrganization structured data present | |

### 6.2 Email Notifications
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 6.2.1 | Team rejection email | Admin rejects a team | Rejection email sent to captain's email | |
| 6.2.2 | Email content | Check rejected email | Contains team name, tournament info, reason | |

### 6.3 API Security
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 6.3.1 | Admin routes protected | Call any `/api/admin/*` without auth | Returns 401 | |
| 6.3.2 | Captain routes protected | Call `/api/captain/me` without auth | Returns 401 | |
| 6.3.3 | Public routes accessible | Call `/api/tournaments` without auth | Returns 200 with data | |
| 6.3.4 | Input validation | Send invalid data to POST endpoints | Returns 400 with validation errors | |

---

## SECTION 7: MOBILE RESPONSIVENESS

### 7.1 Cross-Page Mobile Checks
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 7.1.1 | Home page mobile | View at 400px | All sections readable, no overflow | |
| 7.1.2 | Navigation mobile | Open nav on mobile | Mobile menu/hamburger works | |
| 7.1.3 | Tournament detail mobile | View on mobile | Tabs, content, bracket all usable | |
| 7.1.4 | Registration form mobile | View on mobile | Form fields fill width, submit works | |
| 7.1.5 | Admin sidebar mobile | Open admin on mobile | Sidebar collapsible/accessible | |
| 7.1.6 | Admin tables mobile | View admin table pages on mobile | Tables scroll horizontally or use card layout | |
| 7.1.7 | Playoff bracket mobile | View bracket on mobile | Rounds stack vertically | |
| 7.1.8 | Standings reorder mobile | View reorder on mobile | Card layout with position, arrows, key stats | |

---

## SECTION 8: EDGE CASES

### 8.1 Empty States
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 8.1.1 | No tournaments | Delete all tournaments | Empty state message on tournaments page | |
| 8.1.2 | No teams in division | View division with no teams | Appropriate empty message | |
| 8.1.3 | No matches | View schedule with no matches | Empty state | |
| 8.1.4 | No standings | View standings with no match data | Empty state | |
| 8.1.5 | No news | Remove all news | News section hidden or shows empty | |
| 8.1.6 | No FAQs | Remove all FAQs | FAQ section hidden or shows empty | |
| 8.1.7 | No sponsors | Remove all sponsors | Sponsor bar hidden | |
| 8.1.8 | No awards | View awards with none created | Empty state message | |

### 8.2 Boundary Conditions
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 8.2.1 | Long team name | Create team with 100-char name | Truncated with ellipsis where needed | |
| 8.2.2 | Many divisions | Tournament with 10+ divisions | Division tabs scrollable/wrappable | |
| 8.2.3 | Large bracket | 32-team bracket | All rounds render without breaking layout | |
| 8.2.4 | Invalid tournament slug | Navigate to `/tournaments/nonexistent` | "Tournament Not Found" page | |
| 8.2.5 | Invalid team ID | Navigate to `/teams/99999` | Appropriate error/not found page | |

---

**Total Test Cases: ~200**

**Legend:**
- Status column: Use PASS / FAIL / BLOCKED / SKIPPED
- Priority: All tests are P1 unless noted
