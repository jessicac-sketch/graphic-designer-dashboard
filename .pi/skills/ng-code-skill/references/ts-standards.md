# TypeScript Coding Standards

These are the mandatory TypeScript rules for all code in this workspace. Apply these when writing or reviewing any `.ts` file.

---

## 1. Strict Mode

- `strict: true` must be enabled in `tsconfig.json` — never disable or bypass it.

---

## 2. No `any`

Use `unknown` or define a proper interface/type instead.

```typescript
// ❌ do not do this
let data: any = fetchSomething();
interface Config { [key: string]: any; }

// ✅ do this
let data: unknown = fetchSomething();
interface Config { items: Item[]; mode: 'strict' | 'loose'; }
```

---

## 3. Explicit Return Types

Declare return types on all functions, methods, and arrow functions.

```typescript
// ❌
getDealers(dealerId: string) { return data; }
const parseName = (name: string) => { return parsedName; }

// ✅
getDealers(dealerId: string): Dealers[] { return data; }
const parseName = (name: string): string => { return parsedName; }
```

---

## 4. `const` and `let` — Never `var`

- Use `const` when the value is never reassigned.
- Use `let` only when the value changes.
- Never use `var`.

```typescript
// ❌
var playlistContents = [];

// ✅
const totalContentCount = 10;
let playlistContents: Playlist[] = [];
```

---

## 5. Variable Declaration — Always Assign Default Values

```typescript
// ❌
name: string;
age: number;

// ✅
public name: string = '';
public age: number = 0;
```

If a default is not possible, explicitly declare the type:
```typescript
public dealer: Dealer | null = null;
```

---

## 6. Consistent Primitive Typing

Use one primitive type per variable — avoid `number | string` unions on the same variable.

```typescript
// ❌
let page: number | string;

// ✅
let page: number = 1;
```

---

## 7. Naming Conventions

- **Variables and functions:** `camelCase` only
- **No snake_case, no mixed-case**
- **Accurate naming:** names must describe what the variable actually holds

```typescript
// ❌
d_admin = new DealerAdmin();   // vague + snake_case
is_dealerAdmin = false;         // mixed case
userID = '123';                 // wrong casing
dealers = ['id1', 'id2'];       // misleading — these are IDs, not dealers

// ✅
dealerAdmin = new DealerAdmin();
isDealerAdmin = false;
userId = '123';
dealerIds = ['id1', 'id2'];
```

---

## 8. Access Modifiers — Always Declared

Every class member and method must have an explicit access modifier.

```typescript
// ❌
getTotalPlaylist() { ... }
name = '';

// ✅
public getTotalPlaylist(): Playlist[] { ... }
public name: string = '';
private hasDataLoaded: boolean = false;
```

---

## 9. Variable Grouping Order

Group class variables in this order, then sort alphabetically within each group:

1. `@Input()` decorated
2. `@Output()` decorated
3. `public` variables
4. `private` variables
5. `protected` variables

```typescript
// ✅
export class AppComponent {
  @Input() hostData: Host[] = [];
  @Output() selectedDealer = new EventEmitter<Dealer>();

  public activatedLicense: boolean = false;
  public isDealerAdmin: boolean = false;

  private hasDataLoaded: boolean = false;
  private isAdmin: boolean = true;

  protected unsubscribe = new Subject<void>();
}
```

---

## 10. Method Grouping Order

Group methods in this order, then sort alphabetically within each group:

1. Lifecycle hooks (`ngOnInit`, `ngOnDestroy`, etc.)
2. `public` methods
3. `private` methods
4. `protected` methods

---

## 11. Constructor Object Parameters

For classes with multiple constructor parameters, use an object parameter to avoid positional confusion.

```typescript
// ❌ — order-dependent, hard to read
constructor(firstname: string, lastname: string, age: number) { ... }
const person = new Person('Kumiko', 'Yamaguchi', 25);

// ✅ — order-independent, self-documenting
constructor(p: { firstname: string; lastname: string; age: number }) { ... }
const person = new Person({ age: 25, firstname: 'Kumiko', lastname: 'Yamaguchi' });
```

---

## 12. Constants Files — No Hardcoded Static Values

Extract all static labels, button configs, and UI strings into `constants.ts` files. Never hardcode visible strings in templates.

```typescript
// constants.ts ✅
export const PLAYLIST_SETTING_BUTTONS = [
  { label: 'Edit',  action: PLAYLIST_SETTING_ACTIONS.edit,  icon: 'fas fa-edit' },
  { label: 'Clone', action: PLAYLIST_SETTING_ACTIONS.clone, icon: 'fas fa-copy' },
];

// component.ts ✅
import { PLAYLIST_SETTING_BUTTONS } from './constants';
export class PlaylistComponent {
  public playlistSettings = PLAYLIST_SETTING_BUTTONS;
}
```

---

## 13. Falsy Shorthand

```typescript
// ❌
if (data.length > 0) { ... }

// ✅
if (data.length) { ... }
```

---

## 14. Early Return — Reduce Nesting

Use early returns instead of `else` blocks to reduce nesting and curly braces.

```typescript
// ❌
private methodName(): void {
  if (myCondition) {
    doThis();
    doThat();
  } else {
    doOther();
  }
}

// ✅
private methodName(): void {
  if (myCondition) {
    doThis();
    doThat();
    return;
  }
  doOther();
}
```

---

## 15. One-Liner If Statements

```typescript
// ❌
if (myCondition) {
  return false;
}

// ✅
if (myCondition) return false;
```

---

## 16. Interfaces Over `object` or `any`

```typescript
// ❌
variableOne: any = { firstname: 'Test', age: 9 }

// ✅
export interface Person {
  firstname: string;
  lastname: string;
  age: number;
}
public variableOne: Person = { firstname: 'Test', lastname: 'Doe', age: 9 };
```
