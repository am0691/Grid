# GRID Design System

## Intent
- **WHO**: Korean church leaders (pastors, mentors) — ages 30-55, mobile/desktop dual-use
- **WHAT**: Track individual spiritual growth by area, identify people needing attention, plan activities
- **HOW**: Warm but structured. Like a well-organized pastor's notebook. Calm trust, not cold analytics.

## Palette

### Light Mode
| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| --background | 220 14% 98% | #F8F9FB | Page background (warm white) |
| --foreground | 231 35% 18% | #1E2243 | Primary text (deep indigo-dark) |
| --card | 30 20% 99.5% | #FEFDFB | Card surfaces |
| --card-foreground | 231 35% 18% | #1E2243 | Card text |
| --primary | 231 66% 55% | #3B5BDB | Actions, active states (deep indigo) |
| --primary-foreground | 0 0% 100% | #FFFFFF | Text on primary |
| --secondary | 220 14% 96% | #F1F3F8 | Secondary surfaces |
| --accent | 263 70% 50% | #7C3AED | Highlights, recommendations (violet) |
| --muted | 220 14% 96% | #F1F3F8 | Muted backgrounds |
| --muted-foreground | 220 10% 46% | #6B7280 | Secondary text |
| --border | 220 13% 90% | #E2E5EB | Borders (warm) |
| --destructive | 0 84% 60% | #EF4444 | Errors, deletions |

### Dark Mode (Linear-style deep dark)
| Token | HSL | Usage |
|-------|-----|-------|
| --background | 230 21% 11% | #161926 |
| --foreground | 220 14% 96% | #F1F3F8 |
| --card | 230 21% 14% | #1C2033 |
| --primary | 231 66% 60% | #4C6EE6 |
| --accent | 263 70% 60% | #9461FB |
| --border | 230 15% 22% | #2D3348 |

### Sidebar (Dark, always)
| Token | HSL | Usage |
|-------|-----|-------|
| --sidebar-background | 231 45% 15% | #141832 |
| --sidebar-foreground | 220 14% 85% | #CDD1DA |
| --sidebar-primary | 231 66% 60% | #4C6EE6 |
| --sidebar-accent | 231 30% 22% | #272E4A |

### Semantic Colors
| Token | HSL | Usage |
|-------|-----|-------|
| --growth | 152 60% 42% | #2BB06A | Growth/positive |
| --warning | 38 92% 55% | #F0A829 | Attention needed |
| --danger | 0 84% 60% | #EF4444 | Crisis alerts |

## Typography
- **Display/Heading**: Pretendard Variable (Korean-optimized, geometric sans)
- **Body**: Pretendard Variable
- **Monospace**: JetBrains Mono (code, kbd shortcuts)
- **Scale**: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36
- **Weight**: 400 (body), 500 (medium), 600 (semibold), 700 (bold), 800 (headings)

## Spacing (4px grid)
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96

## Border Radius
- xs: 4px — small badges
- sm: 6px — buttons, inputs
- md: 8px — tags, pills
- lg: 12px — cards, containers (default)
- xl: 16px — modals, large containers

## Depth (Shadows)
- **xs**: `0 1px 2px rgb(0 0 0 / 0.05)` — subtle
- **sm**: `0 1px 3px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.04)` — cards
- **md**: `0 4px 12px rgb(0 0 0 / 0.08)` — hover cards
- **lg**: `0 8px 24px rgb(0 0 0 / 0.12)` — modals
- **glow-indigo**: `0 0 20px hsl(231 66% 55% / 0.15)` — active elements
- **glow-violet**: `0 0 20px hsl(263 70% 50% / 0.15)` — recommendations

## Motion
- **fast**: 150ms ease — color, bg, border transitions
- **normal**: 200ms ease — UI elements
- **slow**: 400ms ease-out — reveals, page transitions
- **bounce**: cubic-bezier(0.34, 1.56, 0.64, 1) — completion celebrations

## Prohibited
- Never use: Inter, Roboto, Arial, system-ui, Space Grotesk
- Never use: purple gradients on white backgrounds
- Never use: raw hex colors in components (use CSS variables)
- Never use: `bg-slate-*`, `bg-gray-*` directly (use semantic tokens)
- Never use: flat gray cells without texture for future states
