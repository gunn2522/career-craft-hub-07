

## Fix: Personality Quiz Crash After Results

### Problem
When taking the personality test, the app crashes with "Cannot read properties of undefined (reading 'dimension')" after completing the quiz. This happens because the auto-advance timer (which moves to the next question after you select an answer) can accidentally push the question counter past the end of the question list.

### What Causes It
The quiz auto-advances to the next question 350ms after you pick an answer. If you also click "Next" manually during that 350ms window, both the timer and the button try to advance -- causing the counter to go to question 61 when only 60 exist.

### Fix (2 changes in `src/components/personality/PersonalityQuiz.tsx`)

**Change 1: Fix the auto-advance timer**
Update the `setTimeout` inside `selectAnswer` to use the functional state updater so it always checks the real current value (not the stale one from 350ms ago):

```typescript
setTimeout(() => {
  setCurrentQuestion((prev) => {
    if (prev < QUESTIONS.length - 1) {
      return prev + 1;
    }
    return prev;
  });
}, 350);
```

**Change 2: Add a safety guard for the question lookup**
Add a guard at the top of the component so if `currentQuestion` somehow goes out of bounds, it resets gracefully instead of crashing:

```typescript
const q = QUESTIONS[currentQuestion];
if (!q) return null;
```

### Files Changed
- `src/components/personality/PersonalityQuiz.tsx` -- both fixes applied

