# Software Requirements Specification (SRS)
## Career Craft Cafe - EdTech Platform

**Document Version:** 4.0  
**Date:** January 23, 2026  
**Standard:** IEEE 830 / IEEE 29148  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Product Overview](#2-product-overview)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Visitor Role System](#4-visitor-role-system)
5. [Information Architecture](#5-information-architecture)
6. [Functional Requirements](#6-functional-requirements)
7. [School Student Career Flow](#7-school-student-career-flow)
8. [Careers Module](#8-careers-module)
9. [Roadmap Module](#9-roadmap-module)
10. [Progress & Gamification](#10-progress--gamification)
11. [Admin Panel](#11-admin-panel)
12. [Live Metrics System](#12-live-metrics-system)
13. [Three Pillars Section](#13-three-pillars-section)
14. [Data Models & Relationships](#14-data-models--relationships)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Edge Cases & Error Handling](#16-edge-cases--error-handling)
17. [Future Scalability](#17-future-scalability)
18. [Acceptance Criteria](#18-acceptance-criteria)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for **Career Craft Cafe**, an EdTech platform designed to guide students through career exploration, skill development, and professional growth.

### 1.2 Scope

Career Craft Cafe provides:
- **Mandatory role-based personalization** at first visit
- Career exploration with interactive career graphs
- **School-to-College career bridge** (After 12th guidance)
- Personalized learning roadmaps
- Progress tracking with gamification
- Mentor connections and networking
- Institution and Partner management
- Resource library (Cafe)
- **Fully admin-driven CMS** with zero hardcoding
- **Live auto-updating metrics**

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|------------|
| RBAC | Role-Based Access Control |
| RLS | Row-Level Security |
| Career Graph | Visual representation of career progression paths |
| Roadmap | Step-by-step learning path for a specific career |
| Cafe | Resource library section of the platform |
| Visitor Role | Pre-login role selection that personalizes the experience |
| Three Pillars | Fixed homepage structure: Career, Craft, Cafe |
| Stream | Academic domain after 12th (Science, Commerce, Arts) |

### 1.4 References

- IEEE 830-1998: Recommended Practice for Software Requirements Specifications
- IEEE 29148-2018: Systems and software engineering — Life cycle processes — Requirements engineering

---

## 2. Product Overview

### 2.1 Product Vision

*"Empowering students to navigate their career journey with clarity, confidence, and community support."*

### 2.2 Product Goals

| ID | Goal | Success Metric |
|----|------|----------------|
| G1 | Enable career discovery | 80% users explore 3+ careers |
| G2 | Provide structured learning paths | 60% roadmap completion rate |
| G3 | Build professional networks | 40% users make 5+ connections |
| G4 | Track measurable progress | 70% weekly active engagement |

### 2.3 Target Users

| User Type | Description | Primary Needs |
|-----------|-------------|---------------|
| School Students | Ages 14-18, exploring career options | Career discovery, basic roadmaps |
| College Students | Ages 18-25, skill development focus | Detailed roadmaps, internships, networking |
| Mentors | Industry professionals | Guide students, share resources |
| Recruiters | HR professionals | Talent discovery, program promotion |
| Admins | Platform managers | Content management, analytics |

### 2.4 Assumptions

1. Users have internet access and modern browsers
2. Students are motivated to explore careers
3. Mentors volunteer time for guidance
4. Career data is regularly updated by admins

### 2.5 Constraints

1. Initial launch targets Indian education market
2. Mobile-responsive web application (no native apps in v1)
3. Supabase/Lovable Cloud backend infrastructure
4. Budget constraints limit AI features to supported models

---

## 3. User Roles & Permissions

### 3.1 Role Definitions

#### 3.1.1 Guest User
- **Description:** Unauthenticated visitor
- **Access Level:** Public pages only
- **Capabilities:** Browse careers, view roadmaps (read-only)

#### 3.1.2 Student (Authenticated User)
- **Description:** Registered platform user
- **Access Level:** All public + authenticated pages
- **Capabilities:** Track progress, save careers, connect with mentors

#### 3.1.3 Mentor
- **Description:** Verified industry professional
- **Access Level:** Student access + mentor tools
- **Capabilities:** Create resources, manage mentees, post blogs

#### 3.1.4 Recruiter
- **Description:** HR/Talent acquisition professional
- **Access Level:** Limited authenticated access
- **Capabilities:** Post internships, view public profiles

#### 3.1.5 Admin
- **Description:** Platform administrator
- **Access Level:** Full system access
- **Capabilities:** All CRUD operations, user management, analytics

### 3.2 Permissions Matrix

| Permission | Guest | Student | Mentor | Recruiter | Admin |
|------------|:-----:|:-------:|:------:|:---------:|:-----:|
| View public careers | ✅ | ✅ | ✅ | ✅ | ✅ |
| View career details | ✅ | ✅ | ✅ | ✅ | ✅ |
| View roadmaps | ✅ | ✅ | ✅ | ✅ | ✅ |
| Start roadmap progress | ❌ | ✅ | ✅ | ❌ | ✅ |
| Save careers | ❌ | ✅ | ✅ | ❌ | ✅ |
| Track progress | ❌ | ✅ | ✅ | ❌ | ✅ |
| Send connection requests | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create resources | ❌ | ❌ | ✅ | ❌ | ✅ |
| Post blogs | ❌ | ❌ | ✅ | ❌ | ✅ |
| Post internships | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage careers | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.3 RBAC Implementation

```sql
-- Database enum for roles
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user', 'mentor');

-- Role check function
CREATE FUNCTION has_role(_role app_role, _user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## 4. Visitor Role System

### 4.1 Mandatory Role Selection

Upon first visit to the website, users MUST select their role before accessing content.

#### 4.1.1 Role Selection Flow

```
First Visit → Role Selection Popup → Store in localStorage → Personalize Experience
```

#### 4.1.2 Available Visitor Roles (Admin-Configurable)

| Role | Name | Description |
|------|------|-------------|
| School Student | `school_student` | Currently in school, exploring career options after 12th |
| College Student | `college_student` | Pursuing higher education, building career skills |
| Mentor | `mentor` | Industry professional ready to guide students |
| Institution | `institution` | Educational institution seeking partnerships |
| Partner Company | `partner` | Company looking to hire or train talent |

#### 4.1.3 Personalization Behavior

- **Homepage sections**: Content adapts based on selected role
- **CTAs**: Call-to-action buttons change per role
- **Navigation**: Priority links change based on role
- **Hero Section**: Title, subtitle, and primary CTA personalized

#### 4.1.4 Technical Implementation

```typescript
// Role stored in localStorage
const VISITOR_ROLE_KEY = 'ccc_visitor_role';
const VISITOR_ROLE_ID_KEY = 'ccc_visitor_role_id';

// Role-based content fetched from homepage_role_content table
```

### 4.2 Admin Management

Administrators can:
- Add/edit/remove visitor role types
- Configure role-specific homepage content (title, subtitle, CTA)
- Toggle role visibility
- Reorder roles in selection popup

---

## 5. Information Architecture

### 5.1 Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with hero, pillars, success stories |
| Careers | `/careers` | Career listing with filters |
| School Careers | `/school-careers` | After 12th career guide |
| Career Detail | `/careers/:slug` | Individual career with graph |
| Programs | `/programs` | Available learning programs |
| Cafe | `/cafe` | Resource library |
| About | `/about` | Platform information |
| Blogs | `/blogs` | Blog articles |
| Ambassador | `/ambassador` | Ambassador program info |
| Partner | `/partner` | Partnership opportunities |
| Institutions | `/institutions` | Institution directory |
| Institution Profile | `/institutions/:id` | Individual institution page |

### 5.2 Authenticated Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with hero, pillars, success stories |
| Careers | `/careers` | Career listing with filters |
| Career Detail | `/careers/:slug` | Individual career with graph |
| Programs | `/programs` | Available learning programs |
| Cafe | `/cafe` | Resource library |
| About | `/about` | Platform information |
| Blogs | `/blogs` | Blog articles |
| Ambassador | `/ambassador` | Ambassador program info |
| Partner | `/partner` | Partnership opportunities |

### 4.2 Authenticated Pages

| Page | Route | Required Role |
|------|-------|---------------|
| My Career Lab | `/my-career-lab` | Student+ |
| Roadmap Detail | `/roadmap/:id` | Student+ |
| Login | `/login` | Guest |
| Signup | `/signup` | Guest |
| Auth | `/auth` | Guest |

### 5.3 Admin Pages

| Page | Route | Required Role |
|------|-------|---------------|
| Dashboard | `/admin` | Admin |
| Homepage Content | `/admin/homepage-content` | Admin |
| Live Metrics | `/admin/metrics` | Admin |
| Access Control | `/admin/access-control` | Super Admin |
| Users | `/admin/users` | Admin |
| Mentor Verification | `/admin/mentor-verification` | Admin |
| Partners | `/admin/partners` | Admin |
| Institutions | `/admin/institutions` | Admin |
| Domains | `/admin/domains` | Admin |
| Categories | `/admin/categories` | Admin |
| Careers Management | `/admin/careers` | Admin |
| Degrees | `/admin/degrees` | Admin |
| Roadmaps Management | `/admin/roadmaps` | Admin |
| Daily Tasks | `/admin/daily-tasks` | Admin |
| Resources | `/admin/resources` | Admin |
| Internships | `/admin/internships` | Admin |
| Programs | `/admin/programs` | Admin |
| Registrations | `/admin/registrations` | Admin |
| Blogs | `/admin/blogs` | Admin |
| Success Stories | `/admin/success-stories` | Admin |
| Events | `/admin/events` | Admin |
| Applications | `/admin/applications` | Admin |

### 4.4 Mentor Pages

| Page | Route | Required Role |
|------|-------|---------------|
| Dashboard | `/mentor` | Mentor |
| Resources | `/mentor/resources` | Mentor |
| Programs | `/mentor/programs` | Mentor |
| Blogs | `/mentor/blogs` | Mentor |
| Daily Tasks | `/mentor/daily-tasks` | Mentor |
| Internships | `/mentor/internships` | Mentor |

---

## 5. Functional Requirements

### 5.1 Authentication Module

#### FR-AUTH-001: User Registration
- **Input:** Email, password, full name, user type
- **Process:** Create auth user, create profile, assign default role
- **Output:** Authenticated session, redirect to dashboard
- **Validation:** Email format, password strength (8+ chars)

#### FR-AUTH-002: User Login
- **Input:** Email, password
- **Process:** Validate credentials, create session
- **Output:** JWT token, user context
- **Error Handling:** Invalid credentials message (no specific field indication)

#### FR-AUTH-003: Session Management
- **Behavior:** Auto-refresh tokens, 7-day session persistence
- **Logout:** Clear all tokens, redirect to home

### 5.2 Experience Level Selection

#### FR-EXP-001: Level Selector Component
- **Location:** Careers page header
- **Options:** Entry | Mid | Senior
- **Default:** Entry level
- **Persistence:** LocalStorage for guests, user profile for authenticated

#### FR-EXP-002: Level Filtering Logic
- **Behavior:** Filter careers by `experience_level` field
- **Visual:** Inactive levels appear grayed
- **Transition:** Smooth fade animation on level change

### 5.3 Career Browsing

#### FR-CAR-001: Career Listing
- **Display:** Grid of career cards
- **Card Content:** Icon, title, experience level badge
- **Sorting:** By domain, then by display_order

#### FR-CAR-002: Career Search
- **Input:** Search query string
- **Matching:** Title, description, skills, search_keywords
- **Ranking:** Exact title match > partial title > skills > keywords
- **Debounce:** 300ms delay before search execution

#### FR-CAR-003: Career Filters
- **Filters:** Domain, Category, Experience Level
- **Behavior:** AND logic between filter groups
- **Reset:** Clear all filters button

---

## 7. School Student Career Flow

### 7.1 Overview

The School Student Career Flow guides 12th-grade students from stream selection to career discovery, bridging into the existing college roadmap system.

#### 7.1.1 Strict User Flow (Non-Negotiable)

```
After Class 12 → Select Stream → Select Category → View Degree Requirements → Link to College Roadmap → Career Roles
```

### 7.2 Stream Selection (Step 1)

**Mandatory** - Users cannot proceed without selecting a stream.

| Stream | Description |
|--------|-------------|
| Science | Engineering, Medical, Data Science, Research, Defence |
| Commerce | Finance, Business, Economics, Banking |
| Arts / Humanities | Law, Design, Psychology, Media, Civil Services |
| Exploring | Undecided students exploring options |

### 7.3 Category Selection (Step 2)

Categories are **stream-locked** - each stream shows only its own categories.

#### Science Stream Categories
- Engineering & Technology
- Medical & Healthcare
- Data & AI
- Research & Pure Sciences
- Defence & Aviation

#### Commerce Stream Categories
- Finance & Accounting
- Business & Management
- Economics
- Entrepreneurship
- Banking & Insurance

#### Arts/Humanities Stream Categories
- Law & Public Policy
- Design & Creative Fields
- Psychology
- Media & Communication
- Civil Services

### 7.4 Roadmap View (Step 3)

Each category displays a roadmap focused on landing the right degree/college.

#### Roadmap Content Structure

| Section | Content |
|---------|---------|
| School-Level Requirements | Required subjects, subject combinations, eligibility criteria |
| Entrance & Preparation | Competitive exams, preparation timeline, skill-building |
| Degree & College Pathways | Required degrees, course duration, career relevance |

### 7.5 College System Connection (Step 4)

**Critical**: Each degree MUST link to the existing college roadmap system.

```
School Roadmap → Degree Selection → Existing College Roadmap → Career Roles & Progression
```

🚫 **Do NOT duplicate college roadmaps** - reuse existing ones.

### 7.6 School-Only Modules

- Scholarships database
- Olympiad preparation resources
- Competitive exam guides
- Early exposure programs

---

## 8. Careers Module

### 6.1 Career Cards

#### Design Specification
```
┌─────────────────────────┐
│     [Category Icon]     │
│                         │
│     Career Title        │
│   [Experience Badge]    │
│                         │
└─────────────────────────┘
```

#### Card Interaction
- **Hover:** Subtle elevation, border highlight
- **Click:** Navigate to `/careers/:slug`
- **Accessibility:** Keyboard navigable, screen reader labels

### 6.2 Career Detail Page

#### Sections

| Section | Content |
|---------|---------|
| Header | Title, category, experience level, save button |
| Overview | Description, demand indicator, growth potential |
| Skills | Required skills with proficiency indicators |
| Salary | Range based on experience level |
| Roadmaps | Linked learning paths |
| Career Graph | Future roles + switch roles visualization |

#### FR-CAR-004: Career Save/Unsave
- **Authenticated:** Toggle save state in `saved_careers` table
- **Guest:** Prompt login modal
- **Visual:** Filled/outlined bookmark icon

### 6.3 Career Graph System

#### 6.3.1 Data Structure
```typescript
interface CareerProgression {
  id: string;
  from_career_id: string;
  to_career_id: string;
  progression_type: 'vertical' | 'lateral';
  skill_gap: string[];
  transition_time: string;
  description: string;
  recommended_roadmap_id: string | null;
}
```

#### 6.3.2 Vertical Growth (Future Roles)
- **Definition:** Same domain, higher responsibility
- **Display:** Upward arrow connections
- **Example:** Junior Developer → Senior Developer → Tech Lead

#### 6.3.3 Lateral Moves (Switch Roles)
- **Definition:** Different domain, similar level
- **Display:** Horizontal connections
- **Example:** Frontend Developer ↔ UX Designer

#### 6.3.4 Visual Representation
```
        ┌─────────────┐
        │  Tech Lead  │ (Future)
        └──────┬──────┘
               │
        ┌──────┴──────┐
        │   Senior    │ (Future)
        │  Developer  │
        └──────┬──────┘
               │
┌──────────────┼──────────────┐
│              │              │
▼              ▼              ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│   UX    │ │ CURRENT │ │ DevOps  │
│Designer │ │  ROLE   │ │Engineer │
└─────────┘ └─────────┘ └─────────┘
 (Switch)               (Switch)
```

#### 6.3.5 Level-Aware Display
- **Same Level:** Full opacity, clickable
- **Different Level:** 50% opacity, greyed badge
- **Click Behavior:** Navigate to career detail

### 6.4 Admin Career Mapping

#### FR-CAR-005: Progression Manager
- **Access:** Admin panel → Careers → Manage Progressions
- **Interface:** Dialog with source career, multi-select targets

#### FR-CAR-006: Mapping Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| From Career | Select | Yes | Source career |
| To Career | Multi-select | Yes | Target career(s) |
| Progression Type | Radio | Yes | vertical/lateral |
| Skill Gap | Tags | No | Skills needed for transition |
| Transition Time | Text | No | Estimated time (e.g., "6-12 months") |
| Description | Textarea | No | Transition guidance |
| Recommended Roadmap | Select | No | Linked learning path |

#### FR-CAR-007: Validation Rules
1. **No Self-Reference:** `from_career_id ≠ to_career_id`
2. **No Duplicates:** Unique (from, to, type) combination
3. **Circular Prevention:** A→B and B→A allowed (bidirectional)
4. **Required Fields:** from_career_id, to_career_id, progression_type

---

## 7. Roadmap Module

### 7.1 Roadmap Structure

```typescript
interface Roadmap {
  id: string;
  title: string;
  description: string;
  career_id: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  steps: RoadmapStep[];
  target_audience: ('school_student' | 'college_student')[];
}

interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  resources: Resource[];
  milestone: boolean;
}
```

### 7.2 Vertical Roadmap UI

#### Visual Design
```
    ○ Step 1: Fundamentals
    │ └── Resources, Duration
    │
    ◉ Step 2: Core Skills (Current)
    │ └── Resources, Duration
    │
    ○ Step 3: Advanced Topics
    │ └── [Locked]
    │
    ★ Milestone: Project Checkpoint
    │
    ○ Step 4: Specialization
        └── [Locked]
```

#### States
- **Completed (○ filled):** Green checkmark
- **Current (◉):** Pulsing indicator, expanded content
- **Locked (○ outline):** Greyed, click shows unlock requirements
- **Milestone (★):** Special styling, badge reward

### 7.3 Progress Tracking

#### FR-RDM-001: Start Roadmap
- **Action:** Click "Start Learning" button
- **System:** Create `user_roadmap_progress` entry
- **Default State:** Step 0, status "in_progress"

#### FR-RDM-002: Complete Step
- **Action:** Mark step as complete
- **Validation:** Previous steps must be completed
- **System:** Update progress, check badge eligibility

#### FR-RDM-003: Progress Persistence
```sql
-- Progress tracking table
CREATE TABLE user_roadmap_progress (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  roadmap_id UUID NOT NULL,
  step_index INTEGER NOT NULL,
  status VARCHAR DEFAULT 'not_started',
  completion_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### 7.4 Resource Mapping

#### FR-RDM-004: Step Resources
- **Types:** Video, Article, Tutorial, Tool, Book
- **Display:** Icon + title + external link
- **Premium:** Lock icon for premium resources

---

## 8. Progress & Gamification

### 8.1 Completion Rules

| Action | Points | Badge Eligibility |
|--------|--------|-------------------|
| Complete step | 10 | - |
| Complete milestone | 50 | Milestone Master |
| Complete roadmap | 200 | Roadmap Champion |
| 7-day streak | 100 | Consistency King |
| First connection | 25 | Networker |
| Save 5 careers | 15 | Explorer |

### 8.2 Streak System

```typescript
interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: Date;
}
```

#### Streak Logic
1. Activity = roadmap progress OR resource view OR connection
2. Streak continues if activity within 24h of last
3. Streak resets at midnight if no activity previous day
4. Longest streak persisted for achievements

### 8.3 Badge System

| Badge | Requirement | Icon |
|-------|-------------|------|
| First Steps | Complete first roadmap step | 🚀 |
| Explorer | Save 5 careers | 🔍 |
| Networker | Make 5 connections | 🤝 |
| Consistency King | 7-day streak | 👑 |
| Roadmap Champion | Complete full roadmap | 🏆 |
| Mentor's Favorite | Get mentor endorsement | ⭐ |

### 8.4 Visual Indicators

- **Progress Bar:** Animated fill with percentage
- **Step Completion:** Confetti animation
- **Badge Earned:** Modal celebration + toast notification
- **Streak Counter:** Fire icon with number

---

## 9. Search & Recommendation

### 9.1 Career Search Algorithm

```typescript
function searchCareers(query: string, filters: Filters): Career[] {
  const results = careers.filter(career => {
    const titleMatch = career.title.toLowerCase().includes(query);
    const skillMatch = career.skills?.some(s => s.includes(query));
    const keywordMatch = career.search_keywords?.some(k => k.includes(query));
    
    return titleMatch || skillMatch || keywordMatch;
  });
  
  return results.sort((a, b) => {
    // Exact title match highest priority
    if (a.title.toLowerCase() === query) return -1;
    if (b.title.toLowerCase() === query) return 1;
    
    // Partial title match next
    if (a.title.toLowerCase().startsWith(query)) return -1;
    if (b.title.toLowerCase().startsWith(query)) return 1;
    
    return 0;
  });
}
```

### 9.2 Career Suggestions

#### FR-SRCH-001: Related Careers
- **Trigger:** Viewing career detail page
- **Logic:** Same category, similar skills overlap
- **Display:** "You might also like" section

#### FR-SRCH-002: Skill-Based Recommendations
- **Input:** User's saved careers and completed roadmaps
- **Logic:** Identify common skills, suggest careers with skill overlap
- **Display:** Dashboard recommendation cards

### 9.3 Skill Gap Analysis

```typescript
interface SkillGap {
  current_skills: string[];
  target_career: Career;
  missing_skills: string[];
  recommended_roadmaps: Roadmap[];
  estimated_time: string;
}
```

#### FR-SRCH-003: Gap Calculator
- **Input:** User profile skills, target career
- **Output:** Missing skills list, roadmap recommendations
- **Display:** Visual comparison chart

---

## 11. Admin Panel

### 11.1 Admin Hierarchy

| Role | Description | Capabilities |
|------|-------------|--------------|
| Super Admin | Platform owner | Full access, manage admins, view audit logs |
| Admin | Content manager | All CRUD, user management, content approval |
| Moderator | Content reviewer | Limited CRUD, content moderation |

### 11.2 Dashboard

#### Metrics Displayed (Live from Database)
- Total students (from `profiles` table)
- Total mentors (from `mentor_profiles` table)
- Total partners (from `partners` table)
- Total roadmaps (from `roadmaps` table)
- Total events (from `events` table)
- Total careers (from `careers` table)

### 10.2 Careers CRUD

#### FR-ADM-001: Create Career
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Title | Text | Yes | Max 100 chars |
| Slug | Text | Auto | Unique, URL-safe |
| Description | Textarea | No | Max 2000 chars |
| Category | Select | Yes | From categories table |
| Domain | Select | Yes | From domains table |
| Experience Level | Select | Yes | entry/mid/senior |
| Skills | Tags | No | Array of strings |
| Salary | Text | No | Format: "₹X-Y LPA" |
| Demand | Select | No | High/Medium/Low |

#### FR-ADM-002: Edit Career
- **Pre-fill:** All existing data
- **Slug:** Editable with uniqueness check
- **Audit:** Track updated_at timestamp

#### FR-ADM-003: Delete Career
- **Soft Delete:** Set is_active = false
- **Cascade:** Warn about linked progressions
- **Confirmation:** Require explicit confirmation

### 10.3 Career Graph Linking

#### FR-ADM-004: Progression Manager UI
```
┌─────────────────────────────────────────┐
│ Career Progression Manager              │
├─────────────────────────────────────────┤
│ Source Career: [UI/UX Designer ▼]       │
│                                         │
│ ┌─ Add Progression ──────────────────┐  │
│ │ Type: ○ Vertical  ● Lateral        │  │
│ │ Target Careers: [Multi-select]     │  │
│ │ Skill Gap: [Tag input]             │  │
│ │ Transition Time: [____________]    │  │
│ │ Description: [________________]    │  │
│ │ Roadmap: [Select optional ▼]       │  │
│ │                    [Add] [Cancel]  │  │
│ └────────────────────────────────────┘  │
│                                         │
│ Existing Progressions:                  │
│ ┌────────────────────────────────────┐  │
│ │ → Senior UX Designer (Vertical)    │  │
│ │   Skills: Leadership, Strategy     │  │
│ │                        [Edit] [×]  │  │
│ └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 10.4 Resource Management

#### FR-ADM-005: Resource CRUD
| Field | Type | Required |
|-------|------|----------|
| Title | Text | Yes |
| Type | Select | Yes |
| URL | URL | Yes |
| Description | Textarea | No |
| Roadmap | Select | No |
| Category | Select | No |
| Is Premium | Toggle | No |

### 10.5 Validation & Error Handling

#### Admin Validation Rules
1. **Required Fields:** Client + server validation
2. **Unique Constraints:** Real-time check on blur
3. **Format Validation:** URL, email patterns
4. **Relationship Integrity:** Prevent orphan references

#### Error Messages
- Generic: "Please fix the highlighted errors"
- Field-specific: Inline below each field
- System: Toast notification for API errors

---

## 12. Live Metrics System

### 12.1 Overview

All numbers displayed on the website are **live and auto-updating** from the database. No hardcoded metrics.

### 12.2 Metric Sources

| Metric | Source Table | Display Label |
|--------|--------------|---------------|
| total_students | profiles | Students Guided |
| total_mentors | mentor_profiles | Expert Mentors |
| total_partners | partners | Partner Companies |
| total_roadmaps | roadmaps | Career Paths |
| total_events | events | Total Events |
| total_careers | careers | Career Roles |

### 12.3 Admin Control

Administrators can:
- Toggle metric visibility
- Rename display labels
- Reorder metrics
- Add new metrics (with table source)

### 12.4 Technical Implementation

```typescript
// Metrics fetched directly from database counts
const [profilesResult, mentorsResult, partnersResult] = await Promise.all([
  supabase.from('profiles').select('id', { count: 'exact', head: true }),
  supabase.from('mentor_profiles').select('id', { count: 'exact', head: true }),
  supabase.from('partners').select('id', { count: 'exact', head: true }).eq('is_visible', true),
]);
```

---

## 13. Three Pillars Section

### 13.1 Overview

The "3 Pillars to Success" is a **global, static structural section** on the homepage that is identical for all users regardless of role.

### 13.2 Structure (IMMUTABLE)

| Position | Pillar Name | Purpose |
|----------|-------------|---------|
| 1 | Career | Find the right career |
| 2 | Craft | Build your skills |
| 3 | Cafe | Access resources & community |

### 13.3 Immutable Rules

- ❌ Names CANNOT be changed
- ❌ Order CANNOT be changed  
- ❌ Number of pillars CANNOT be changed (always 3)
- ✅ Same for ALL users, always visible on homepage

### 13.4 Admin-Editable Content

| Field | Editable |
|-------|----------|
| Subtitle | ✅ Yes |
| Description | ✅ Yes |
| CTA Link | ✅ Yes |
| Icon | ✅ Yes |
| Pillar Name | ❌ No (Locked) |
| Pillar Order | ❌ No (Locked) |

### 13.5 SRS Documentation Requirement

This specification explicitly states:
- "3 Pillars to Success is a global, static structural section"
- "Career, Craft, Cafe are fixed semantic pillars of the platform"
- "Only content inside pillars is configurable, not structure"

---

## 14. Data Models & Relationships

### 14.1 Entity Relationship Diagram (Textual)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   DOMAINS   │────<│ CATEGORIES  │────<│   CAREERS   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
           ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
           │  ROADMAPS   │            │ PROGRESSIONS│            │SAVED_CAREERS│
           └──────┬──────┘            └─────────────┘            └─────────────┘
                  │
     ┌────────────┴────────────┐
     ▼                         ▼
┌─────────────┐        ┌─────────────┐
│  RESOURCES  │        │  PROGRESS   │
└─────────────┘        └─────────────┘
```

### 11.2 Key Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| Domain → Categories | 1:N | Domain contains many categories |
| Category → Careers | 1:N | Category contains many careers |
| Career → Roadmaps | 1:N | Career has multiple roadmaps |
| Career → Progressions | 1:N | Career has future/switch paths |
| Roadmap → Resources | 1:N | Roadmap step has resources |
| User → Progress | 1:N | User tracks multiple roadmaps |
| User → Saved Careers | N:M | User saves many careers |

### 11.3 Career Graph Relationships

```sql
-- Career progressions table
CREATE TABLE career_progressions (
  id UUID PRIMARY KEY,
  from_career_id UUID REFERENCES careers(id),
  to_career_id UUID REFERENCES careers(id),
  progression_type VARCHAR CHECK (progression_type IN ('vertical', 'lateral')),
  skill_gap TEXT[],
  transition_time VARCHAR,
  description TEXT,
  recommended_roadmap_id UUID REFERENCES roadmaps(id),
  display_order INTEGER,
  UNIQUE(from_career_id, to_career_id, progression_type)
);
```

---

## 12. Non-Functional Requirements

### 12.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load | < 3s | Lighthouse FCP |
| API Response | < 500ms | 95th percentile |
| Search Results | < 200ms | Debounced query |
| Image Load | < 1s | Lazy loaded |

### 12.2 Security

#### Authentication
- JWT tokens with 1-hour expiry
- Refresh tokens with 7-day expiry
- Password hashing with bcrypt

#### Authorization
- Row-Level Security on all tables
- Role-based access middleware
- API rate limiting (100 req/min)

#### Data Protection
- HTTPS enforced
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized inputs)
- CSRF tokens for mutations

### 12.3 Scalability

- Horizontal scaling via edge functions
- CDN for static assets
- Database connection pooling
- Caching for frequently accessed data

### 12.4 SEO

| Requirement | Implementation |
|-------------|----------------|
| Meta Tags | Title < 60 chars, description < 160 chars |
| Semantic HTML | Proper heading hierarchy, landmarks |
| URL Structure | Slug-based, descriptive paths |
| Sitemap | Auto-generated XML sitemap |
| robots.txt | Configured for crawlers |

### 12.5 Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratio ≥ 4.5:1
- Focus indicators visible

### 12.6 Logging & Monitoring

- Error tracking with stack traces
- User action analytics
- Performance metrics dashboard
- Uptime monitoring (99.9% target)

---

## 13. Edge Cases & Error Handling

### 13.1 404 Prevention

| Scenario | Handling |
|----------|----------|
| Invalid career slug | Redirect to /careers with toast |
| Deleted roadmap access | Show "No longer available" message |
| Invalid user profile | Redirect to profile setup |

### 13.2 Missing Data

| Scenario | Handling |
|----------|----------|
| No career progressions | Show "Growth paths coming soon" |
| Empty search results | Show suggestions |
| No roadmap resources | Show placeholder content |

### 13.3 Permission Violations

| Scenario | Handling |
|----------|----------|
| Unauthorized admin access | Redirect to login, log attempt |
| Expired session | Auto-refresh or prompt re-login |
| Rate limit exceeded | 429 response with retry-after |

### 13.4 Invalid Admin Actions

| Scenario | Handling |
|----------|----------|
| Delete career with progressions | Warning dialog, cascade option |
| Duplicate progression | Prevent save, show existing |
| Self-referential progression | Validation error message |

---

## 14. Future Scalability

### 14.1 AI Recommendations (Phase 2)

- Career path prediction based on profile
- Personalized roadmap ordering
- Skill gap auto-detection
- Resume-to-career matching

### 14.2 Mentor Matching (Phase 2)

- Algorithm-based mentor suggestions
- Availability calendar integration
- Video call scheduling
- Mentorship tracking

### 14.3 Recruiter Integration (Phase 3)

- Job posting from career pages
- Candidate pool access
- Application tracking
- Skills verification badges

### 14.4 Mobile Application (Phase 3)

- React Native implementation
- Offline roadmap access
- Push notifications for streaks
- Mobile-optimized resources

---

## 15. Acceptance Criteria

### 15.1 Career Module

| ID | Criterion | Testable Statement |
|----|-----------|-------------------|
| AC-C01 | Career listing loads | Page displays 20+ career cards within 3s |
| AC-C02 | Search works | Typing "developer" shows relevant results |
| AC-C03 | Filters apply | Selecting domain filters career list |
| AC-C04 | Detail page loads | Clicking card navigates to slug-based URL |
| AC-C05 | Career graph displays | Progression cards visible for mapped careers |

### 15.2 Roadmap Module

| ID | Criterion | Testable Statement |
|----|-----------|-------------------|
| AC-R01 | Roadmap starts | Clicking "Start" creates progress record |
| AC-R02 | Steps track | Completing step updates progress bar |
| AC-R03 | Resources accessible | Resource links open correctly |
| AC-R04 | Locking works | Future steps show locked state |

### 15.3 Admin Module

| ID | Criterion | Testable Statement |
|----|-----------|-------------------|
| AC-A01 | Career CRUD | Admin can create, edit, delete careers |
| AC-A02 | Progression mapping | Admin can add future/switch roles |
| AC-A03 | Validation works | Invalid data shows error messages |
| AC-A04 | Changes reflect | Updates visible on public pages |

### 15.4 Authentication

| ID | Criterion | Testable Statement |
|----|-----------|-------------------|
| AC-AU01 | Registration works | New user can sign up and access dashboard |
| AC-AU02 | Login works | Existing user can log in |
| AC-AU03 | Protected routes | Unauthenticated users redirected to login |
| AC-AU04 | Role enforcement | Non-admin cannot access /admin routes |

---

## Appendix A: Database Schema Summary

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| careers | Career definitions | title, slug, category_id, experience_level |
| career_domains | Top-level groupings | name, icon, display_order |
| career_categories | Sub-groupings | name, domain_id |
| career_progressions | Growth/switch paths | from_career_id, to_career_id, type |
| roadmaps | Learning paths | title, career_id, steps (JSON) |
| resources | Learning materials | title, type, url, roadmap_id |
| profiles | User information | user_id, full_name, skills |
| user_roadmap_progress | Progress tracking | user_id, roadmap_id, step_index |
| saved_careers | User bookmarks | user_id, career_id |
| badges | Achievement definitions | name, requirement_type |
| user_badges | Earned achievements | user_id, badge_id |

---

## Appendix B: API Endpoints Summary

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /careers | List all active careers |
| GET | /careers/:slug | Get career details |
| GET | /roadmaps | List all roadmaps |
| GET | /roadmaps/:id | Get roadmap details |
| GET | /resources | List all resources |

### Authenticated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /saved-careers | Save a career |
| DELETE | /saved-careers/:id | Unsave a career |
| POST | /roadmap-progress | Start roadmap |
| PATCH | /roadmap-progress/:id | Update progress |
| GET | /profile | Get user profile |
| PATCH | /profile | Update profile |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /admin/careers | Create career |
| PATCH | /admin/careers/:id | Update career |
| DELETE | /admin/careers/:id | Delete career |
| POST | /admin/progressions | Create progression |
| DELETE | /admin/progressions/:id | Delete progression |

---

**Document End**

*This SRS serves as the single source of truth for the Career Craft Cafe platform development.*
